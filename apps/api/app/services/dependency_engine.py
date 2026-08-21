import uuid
from typing import Dict, List, Set, Any
from sqlalchemy.orm import Session
from app.models.project import Task, TaskDependency, TaskBlocker, Milestone

def get_project_dependencies(db: Session, project_id: uuid.UUID) -> Dict[str, Any]:
    """
    Computes deterministic DAG graph, blocked tasks, and critical path for a project.
    """
    # 1. Fetch all tasks for the project
    tasks = (
        db.query(Task)
        .join(Milestone, Task.milestone_id == Milestone.id)
        .filter(Milestone.project_id == project_id)
        .all()
    )
    task_map = {str(t.id): t for t in tasks}
    task_ids = set(task_map.keys())
    raw_uuids = [t.id for t in tasks]

    # 2. Fetch all dependencies
    dependencies = (
        db.query(TaskDependency)
        .filter(TaskDependency.task_id.in_(raw_uuids))
        .all()
    ) if raw_uuids else []

    # Build adjacency lists
    # depends_on: Task B depends on Task A (Task A -> Task B)
    adj_out: Dict[str, List[str]] = {t_id: [] for t_id in task_ids}
    adj_in: Dict[str, List[str]] = {t_id: [] for t_id in task_ids}
    edges = []

    for dep in dependencies:
        tid = str(dep.task_id)
        dep_id = str(dep.depends_on_task_id)
        if tid in task_map and dep_id in task_map:
            adj_out[dep_id].append(tid) # dep_id blocks tid
            adj_in[tid].append(dep_id)   # tid requires dep_id
            edges.append({
                "id": str(dep.id),
                "task_id": tid,
                "depends_on_task_id": dep_id,
                "dependency_type": dep.dependency_type
            })

    # 3. Identify blocked tasks (either due to incomplete dependencies or active TaskBlockers)
    blocked_task_ids: Set[str] = set()

    # Active blockers
    if raw_uuids:
        active_blockers = (
            db.query(TaskBlocker)
            .filter(TaskBlocker.task_id.in_(raw_uuids), TaskBlocker.status == "ACTIVE")
            .all()
        )
        for b in active_blockers:
            blocked_task_ids.add(str(b.task_id))

    # Incomplete dependencies (if prerequisite is not DONE)
    for tid, reqs in adj_in.items():
        for req_id in reqs:
            req_task = task_map[req_id]
            if (req_task.status or "").lower() != "done":
                blocked_task_ids.add(tid)
                break

    # 4. Deterministic Critical Path calculation (Longest Path in DAG)
    # Distance/duration = estimated_hours (defaulting to 1.0 if 0)
    in_degree = {t_id: len(adj_in[t_id]) for t_id in task_ids}
    durations = {t_id: max(task_map[t_id].estimated_hours or 0.0, 1.0) for t_id in task_ids}
    dist = {t_id: durations[t_id] for t_id in task_ids}
    parent = {t_id: None for t_id in task_ids}

    # Topological sort (Kahn's algorithm)
    zero_in = [t_id for t_id, deg in in_degree.items() if deg == 0]
    topo_order = []
    queue = list(zero_in)

    while queue:
        u = queue.pop(0)
        topo_order.append(u)
        for v in adj_out[u]:
            if dist[u] + durations[v] > dist[v]:
                dist[v] = dist[u] + durations[v]
                parent[v] = u
            in_degree[v] -= 1
            if in_degree[v] == 0:
                queue.append(v)

    # Find node with max distance
    critical_path = []
    if dist:
        max_node = max(dist.keys(), key=lambda k: dist[k])
        curr = max_node
        while curr:
            critical_path.append(curr)
            curr = parent[curr]
        critical_path.reverse()

    nodes = [
        {
            "id": str(t.id),
            "title": t.title,
            "status": t.status,
            "priority": t.priority,
            "estimated_hours": t.estimated_hours,
            "actual_hours": t.actual_hours,
            "is_blocked": str(t.id) in blocked_task_ids
        }
        for t in tasks
    ]

    return {
        "nodes": nodes,
        "edges": edges,
        "blocked_tasks": list(blocked_task_ids),
        "critical_path": critical_path
    }

def validate_dependency_cycle(db: Session, task_id: uuid.UUID, depends_on_task_id: uuid.UUID) -> bool:
    """
    Returns True if adding (task_id -> depends_on_task_id) would introduce a cycle.
    """
    if task_id == depends_on_task_id:
        return True # Self dependency

    # Find milestone to get project tasks
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        return False

    project_id = db.query(Milestone.project_id).filter(Milestone.id == task.milestone_id).scalar()
    if not project_id:
        return False

    task_id_objs = [
        t[0] for t in db.query(Task.id)
        .join(Milestone, Task.milestone_id == Milestone.id)
        .filter(Milestone.project_id == project_id)
        .all()
    ]
    t_set = {str(uid) for uid in task_id_objs}

    deps = db.query(TaskDependency).filter(TaskDependency.task_id.in_(task_id_objs)).all() if task_id_objs else []
    adj = {t_id: [] for t_id in t_set}
    for d in deps:
        adj[str(d.depends_on_task_id)].append(str(d.task_id))

    # Add proposed edge: depends_on_task_id -> task_id
    adj[str(depends_on_task_id)].append(str(task_id))

    # DFS cycle check starting from task_id
    visited = set()
    stack = set()

    def dfs(node: str) -> bool:
        visited.add(node)
        stack.add(node)
        for nxt in adj.get(node, []):
            if nxt not in visited:
                if dfs(nxt):
                    return True
            elif nxt in stack:
                return True
        stack.remove(node)
        return False

    return dfs(str(task_id))
