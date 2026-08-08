'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import Breadcrumbs from '../../components/Breadcrumbs';

type Skill = { id: string; name: string; slug: string };

export default function Onboarding() {
  const { user, refetchUser } = useAuth();
  const router = useRouter();

  const [skills, setSkills] = useState<Skill[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [fullName, setFullName] = useState('');
  const [educationYear, setEducationYear] = useState('3rd year');
  const [targetRole, setTargetRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('intermediate');
  const [interests, setInterests] = useState('');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api('/skills')
      .then(setSkills)
      .catch(() => setMsg('Could not load skills list. Make sure backend is running.'));

    if (user) {
      if (user.full_name) setFullName(user.full_name);
      if (user.education_year) setEducationYear(user.education_year);
      if (user.target_role) setTargetRole(user.target_role);
      if (user.experience_level) setExperienceLevel(user.experience_level);
      if (user.interests) setInterests(user.interests);
      if (user.skills && user.skills.length > 0) {
        setSelected(user.skills.map((s) => s.slug));
      }
    }
  }, [user]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg('');
    setSaving(true);
    try {
      await api('/me', {
        method: 'PATCH',
        body: JSON.stringify({
          full_name: fullName,
          education_year: educationYear,
          target_role: targetRole,
          experience_level: experienceLevel,
          interests: interests,
          skill_slugs: selected,
          onboarding_completed: true,
        }),
      });
      await refetchUser();
      router.push('/dashboard');
    } catch (err: any) {
      setMsg(err instanceof Error ? err.message : 'Could not save profile');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="shell formPage">
      <Breadcrumbs />
      <span className="tag">Student Onboarding</span>
      <h1 style={{ fontSize: 36, margin: '12px 0 8px', fontFamily: 'Georgia, serif' }}>Tell us where you are starting.</h1>
      <p className="lead">
        This information is used to personalize project recommendations and evidence claims. Your profile remains private by default.
      </p>

      <form className="formCard" onSubmit={submit} style={{ maxWidth: 680 }}>
        <label>
          Full Name
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} required maxLength={120} placeholder="Anuvardhan" />
        </label>
        <label>
          Education Year
          <select value={educationYear} onChange={(e) => setEducationYear(e.target.value)} required>
            {['1st year', '2nd year', '3rd year', '4th year', 'Graduated / Boot camp'].map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </label>
        <label>
          Target Role
          <input
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Backend Engineer, Full-Stack Developer"
            required
          />
        </label>
        <label>
          Experience Level
          <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} required>
            <option value="beginner">Beginner (Learning syntax & fundamentals)</option>
            <option value="intermediate">Intermediate (Built basic applications)</option>
            <option value="challenging">Advanced (Building production systems)</option>
          </select>
        </label>
        <label>
          Interests & Domains
          <input
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="AI, web tools, distributed systems, fintech…"
          />
        </label>
        <fieldset style={{ border: 0, padding: 0, margin: '12px 0 0' }}>
          <legend style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Current Skills & Familiar Technologies</legend>
          <div className="chips">
            {skills.map((s) => (
              <button
                type="button"
                className={selected.includes(s.slug) ? 'chip active' : 'chip'}
                key={s.slug}
                onClick={() =>
                  setSelected((v) => (v.includes(s.slug) ? v.filter((x) => x !== s.slug) : [...v, s.slug]))
                }
              >
                {s.name}
              </button>
            ))}
          </div>
        </fieldset>
        <button className="btn primary" type="submit" disabled={saving} style={{ marginTop: 16 }}>
          {saving ? 'Saving Profile…' : 'Complete Onboarding & Continue →'}
        </button>
        {msg && (
          <p className="status" style={{ color: 'var(--danger)', margin: '8px 0 0' }}>
            ⚠️ {msg}
          </p>
        )}
      </form>
    </main>
  );
}
