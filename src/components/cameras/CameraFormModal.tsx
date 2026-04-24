/**
 * Shared Add / Edit camera modal.
 * Pass `initial` to pre-fill fields for edit mode.
 */
import { useState, type FormEvent } from 'react';
import type { Camera, CreateCameraInput } from '@/api/cameras';

interface Props {
  mode:      'add' | 'edit';
  initial?:  Camera;
  onSubmit:  (input: CreateCameraInput) => Promise<void>;
  onClose:   () => void;
}

const empty: CreateCameraInput = {
  name: '', rtspUrl: '', username: '', password: '',
  manufacturer: '', model: '', location: '', siteId: '',
};

export const CameraFormModal = ({ mode, initial, onSubmit, onClose }: Props) => {
  const [form, setForm] = useState<CreateCameraInput>({
    name:         initial?.name         ?? '',
    rtspUrl:      '',           // never pre-filled (encrypted at rest)
    username:     '',
    password:     '',
    manufacturer: initial?.manufacturer ?? '',
    model:        initial?.model        ?? '',
    location:     initial?.location     ?? '',
    siteId:       initial?.siteId       ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  const set = (k: keyof CreateCameraInput) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      // Strip empty optional strings
      const cleaned: CreateCameraInput = { name: form.name, rtspUrl: form.rtspUrl };
      if (form.username)     cleaned.username     = form.username;
      if (form.password)     cleaned.password     = form.password;
      if (form.manufacturer) cleaned.manufacturer = form.manufacturer;
      if (form.model)        cleaned.model        = form.model;
      if (form.location)     cleaned.location     = form.location;
      if (form.siteId)       cleaned.siteId       = form.siteId;
      await onSubmit(cleaned);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving camera');
    } finally {
      setSaving(false);
    }
  };

  const field = (
    label: string,
    key: keyof CreateCameraInput,
    opts?: { type?: string; required?: boolean; placeholder?: string },
  ) => (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-400">
        {label}{opts?.required && <span className="ml-1 text-red-400">*</span>}
      </span>
      <input
        type={opts?.type ?? 'text'}
        required={opts?.required}
        placeholder={opts?.placeholder}
        value={form[key] ?? ''}
        onChange={set(key)}
        className="rounded border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
    </label>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl"
      >
        <h2 className="mb-4 text-lg font-semibold text-white">
          {mode === 'add' ? 'Add Camera' : 'Edit Camera'}
        </h2>

        <div className="flex flex-col gap-3">
          {field('Name',          'name',         { required: true })}
          {field('RTSP URL',      'rtspUrl',      { required: mode === 'add', placeholder: 'rtsp://192.168.1.x/stream' })}
          {field('Username',      'username',     {})}
          {field('Password',      'password',     { type: 'password' })}
          {field('Manufacturer',  'manufacturer', {})}
          {field('Model',         'model',        {})}
          {field('Location',      'location',     {})}
          {field('Site ID',       'siteId',       {})}
        </div>

        {error && (
          <p className="mt-3 rounded bg-red-900/40 px-3 py-2 text-sm text-red-300">{error}</p>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-white/20 px-4 py-1.5 text-sm text-gray-300 hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {saving ? 'Saving…' : mode === 'add' ? 'Add Camera' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export { empty };
