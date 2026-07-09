"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "@/i18n/client";
import { Pencil, Trash2 } from "lucide-react";
import { useProfile, type ProfileData } from "../../useProfile";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function PersonalInformation() {
  const t = useTranslations("features_profile_components_settings_PersonalInformation");
  const { data, update } = useProfile();
  const fileRef = useRef<HTMLInputElement>(null);

  const onPickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update({ photo: String(reader.result) });
    reader.readAsDataURL(file);
    e.target.value = ""; // allow re-picking the same file
  };

  return (
    <div>
      {/* Avatar */}
      <div className="flex flex-col items-center py-6">
        <div className="relative">
          {data.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.photo} alt="" className="h-28 w-28 rounded-full object-cover" />
          ) : (
            <div className="bg-lavender grid h-28 w-28 place-items-center rounded-full text-4xl">
              🙂
            </div>
          )}
          <Button
            unstyled
            type="button"
            aria-label={t("changePhoto")}
            onClick={() => fileRef.current?.click()}
            className="bg-ink absolute right-1 bottom-1 grid h-9 w-9 place-items-center rounded-full text-white transition-transform hover:-translate-y-0.5 active:scale-95"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Input
            unstyled
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={onPickPhoto}
            className="hidden"
          />
        </div>
        <p className="text-muted mt-3 font-semibold">{t("profilePhoto")}</p>
        {data.photo && (
          <Button
            unstyled
            type="button"
            onClick={() => update({ photo: undefined })}
            className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:underline"
          >
            <Trash2 className="h-3.5 w-3.5" /> {t("remove")}
          </Button>
        )}
      </div>

      {/* Editable fields */}
      <div className="divide-hairline border-hairline divide-y border-y">
        <Field label={t("firstName")} value={data.firstName} onSave={(v) => update({ firstName: v })} />
        <Field label={t("lastName")} value={data.lastName} onSave={(v) => update({ lastName: v })} />
        <Field label={t("email")} type="email" value={data.email} onSave={(v) => update({ email: v })} />
        <Field
          label={t("username")}
          value={data.handle}
          prefix="@"
          onSave={(v) => update({ handle: v.replace(/^@/, "") })}
        />
      </div>

      <p className="text-muted mt-4 text-center text-sm">{t("tapToEdit")}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onSave,
  type = "text",
  prefix,
}: {
  label: string;
  value: string;
  onSave: (v: string) => void;
  type?: string;
  prefix?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  useEffect(() => {
    if (!editing) setVal(value);
  }, [value, editing]);

  const commit = () => {
    const trimmed = val.trim();
    if (trimmed) onSave(trimmed);
    setEditing(false);
  };

  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <span className="text-muted shrink-0 font-semibold">{label}</span>
      {editing ? (
        <Input
          unstyled
          autoFocus
          type={type}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setVal(value);
              setEditing(false);
            }
          }}
          className="border-violet bg-surface text-ink w-1/2 rounded-lg border px-3 py-1.5 text-right font-semibold outline-none"
        />
      ) : (
        <Button
          unstyled
          type="button"
          onClick={() => setEditing(true)}
          className="group text-ink flex min-w-0 items-center gap-2 font-semibold"
        >
          <span className="group-hover:text-violet truncate">
            {prefix}
            {value}
          </span>
          <Pencil className="text-muted group-hover:text-violet h-3.5 w-3.5 shrink-0" />
        </Button>
      )}
    </div>
  );
}
