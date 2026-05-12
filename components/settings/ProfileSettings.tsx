'use client'
import { FormEvent, useMemo, useState } from 'react'
import Button from '@/components/ui/Button'
import Toast from '@/components/ui/Toast'
import { Input, Textarea } from '@/components/ui/FormElements'
import { SessionUserExt } from './types'

type Props = { user: SessionUserExt; onSaved: (next: Partial<SessionUserExt>) => void }

export default function ProfileSettings({ user, onSaved }: Props) {
  const [name, setName] = useState(user.name)
  const [college, setCollege] = useState(user.college || '')
  const [bio, setBio] = useState(user.sellerBio || '')
  const [githubUrl, setGithubUrl] = useState(user.githubUrl || '')
  const [linkedinUrl, setLinkedinUrl] = useState(user.linkedinUrl || '')
  const [avatar, setAvatar] = useState(user.avatar || '')
  const [skillInput, setSkillInput] = useState('')
  const [skills, setSkills] = useState<string[]>(() => (user.skills ? user.skills.split(',').map((s) => s.trim()).filter(Boolean) : []))
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const avatarPreview = useMemo(() => avatar || '', [avatar])

  const addSkill = () => {
    const normalized = skillInput.trim()
    if (!normalized) return
    if (!skills.includes(normalized)) setSkills((s) => [...s, normalized])
    setSkillInput('')
  }

  const removeSkill = (skill: string) => setSkills((s) => s.filter((x) => x !== skill))

  const handleFile = (file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setAvatar(String(reader.result || ''))
    reader.readAsDataURL(file)
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/settings/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, college, bio, skills, githubUrl, linkedinUrl, avatar }),
      })
      const data = await res.json()
      if (!res.ok) {
        setToast({ msg: data.error || 'Failed to save profile', type: 'error' })
      } else {
        onSaved({
          name: data.user.name,
          college: data.user.college,
          sellerBio: data.user.sellerBio,
          skills: data.user.skills,
          githubUrl: data.user.githubUrl,
          linkedinUrl: data.user.linkedinUrl,
          avatar: data.user.avatar,
        })
        setToast({ msg: 'Profile saved successfully', type: 'success' })
      }
    } catch {
      setToast({ msg: 'Network error while saving profile', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="glass-panel rounded-2xl p-6">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <h2 className="font-display text-3xl mb-6">Profile Settings</h2>
      <form className="space-y-5" onSubmit={onSubmit}>
        <Input label="Display Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="College / University" value={college} onChange={(e) => setCollege(e.target.value)} />
          <label className="block">
            <span className="block text-[10px] uppercase tracking-[2px] text-[var(--grey-light)] mb-2">Profile Photo</span>
            <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0] || null)} />
            {avatarPreview && <img src={avatarPreview} alt="Avatar preview" className="mt-3 w-14 h-14 rounded-full object-cover border border-[var(--line)]" />}
          </label>
        </div>
        <Textarea label="Bio / About Me" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />

        <div>
          <span className="block text-[10px] uppercase tracking-[2px] text-[var(--grey-light)] mb-2">Skills</span>
          <div className="flex flex-wrap gap-2 mb-2">
            {skills.map((skill) => (
              <button type="button" onClick={() => removeSkill(skill)} key={skill} className="px-2 py-1 text-[11px] rounded-full bg-[var(--teal-pale)] text-[var(--forest)]">
                {skill} ×
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} placeholder="Add skill" />
            <Button type="button" size="sm" onClick={addSkill}>Add</Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Input label="GitHub URL" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} />
          <Input label="LinkedIn URL" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} />
        </div>

        <Button type="submit" size="md" loading={loading}>Save Changes</Button>
      </form>
    </section>
  )
}
