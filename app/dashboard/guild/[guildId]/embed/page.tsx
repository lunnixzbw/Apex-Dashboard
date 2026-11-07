"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { PenLine, Send, Plus, Trash2, RefreshCcw, Link2, Braces, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type Field = { name: string; value: string; inline: boolean };
type Btn = { label: string; url: string };
type State = {
  channel_id: string;
  content: string;
  title: string; description: string; url: string; color: string;
  author_name: string; author_icon: string; author_url: string;
  footer_text: string; footer_icon: string;
  thumbnail_url: string; image_url: string; timestamp: boolean;
  fields: Field[]; buttons: Btn[];
};

const EMPTY: State = {
  channel_id: "", content: "",
  title: "", description: "", url: "", color: "#2B2D31",
  author_name: "", author_icon: "", author_url: "",
  footer_text: "", footer_icon: "",
  thumbnail_url: "", image_url: "", timestamp: false,
  fields: [], buttons: [],
};

const DRAFT = (id: string) => `zv-embed-draft-${id}`;

export default function EmbedCreatorPage({ params }: { params: { guildId: string } }) {
  const gid = params.guildId;
  const [s, setS] = useState<State>(EMPTY);
  const [channels, setChannels] = useState<{ id: string; name: string; type: string }[]>([]);
  const [vars, setVars] = useState<{ key: string; description: string }[]>([]);
  const [guild, setGuild] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const focused = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const focusedKey = useRef<string>("description");

  useEffect(() => {
    (async () => {
      try {
        const [ch, v, g] = await Promise.all([api.getChannels(gid), api.getEmbedVariables(gid), api.getGuildDetails(gid).catch(() => null)]);
        setChannels(ch.filter((c: any) => c.type === "0" || c.type === "5"));
        setVars(v);
        setGuild(g);
      } catch {
        toast.error("Could not load channels. Try refreshing.");
      } finally {
        setLoading(false);
      }
    })();
    try {
      const d = localStorage.getItem(DRAFT(gid));
      if (d) setS({ ...EMPTY, ...JSON.parse(d) });
    } catch { /* no saved draft */ }
  }, [gid]);

  useEffect(() => {
    const t = setTimeout(() => { try { localStorage.setItem(DRAFT(gid), JSON.stringify({ ...s, channel_id: "" })); } catch { /* ignore */ } }, 500);
    return () => clearTimeout(t);
  }, [s, gid]);

  const set = <K extends keyof State>(k: K, v: State[K]) => setS((p) => ({ ...p, [k]: v }));

  // Click a variable: it is inserted where the cursor was in the last text box you used.
  const insertVar = (key: string) => {
    const el = focused.current;
    const field = focusedKey.current as keyof State;
    if (el && typeof s[field] === "string") {
      const start = el.selectionStart ?? el.value.length;
      const end = el.selectionEnd ?? start;
      const next = el.value.slice(0, start) + key + el.value.slice(end);
      set(field, next as any);
      requestAnimationFrame(() => { el.focus(); el.setSelectionRange(start + key.length, start + key.length); });
    } else {
      set("description", (s.description + key) as any);
    }
  };
  const track = (name: keyof State) => ({
    onFocus: (e: React.FocusEvent<any>) => { focused.current = e.target; focusedKey.current = name as string; },
    value: s[name] as string,
    onChange: (e: React.ChangeEvent<any>) => set(name, e.target.value),
  });

  // Preview values (the real bot fills the same variables when it sends).
  const sample: Record<string, string> = {
    "user": "@You", "user.name": "You", "user.id": "123456789012345678", "user.avatar": "",
    "server": guild?.name || "Your Server", "server.id": gid, "server.icon": guild?.icon || "",
    "server.members": String(guild?.member_count ?? "1,000"), "server.boosts": "14", "server.owner": "@Owner",
    "channel": "#channel", "channel.name": "channel", "date": new Date().toISOString().slice(0, 10), "time": new Date().toISOString().slice(11, 16) + " UTC",
  };
  const fill = (t: string) => (t || "").replace(/\{([a-z.]+)\}/gi, (m, k) => (k.toLowerCase() in sample ? sample[k.toLowerCase()] : m));
  const img = (u: string) => { const f = fill(u); return /^https?:\/\//.test(f) ? f : ""; };

  const hasEmbed = useMemo(() => !!(s.title || s.description || s.author_name || s.footer_text || s.thumbnail_url || s.image_url || s.timestamp || s.fields.some((f) => f.name && f.value)), [s]);

  const send = async () => {
    if (!s.channel_id) return toast.error("Choose a channel first.");
    if (!s.content.trim() && !hasEmbed) return toast.error("Write a message or fill in the embed.");
    setSending(true);
    try {
      await api.sendEmbed(gid, {
        channel_id: s.channel_id,
        content: s.content,
        embed: hasEmbed ? {
          title: s.title, description: s.description, url: s.url, color: s.color, timestamp: s.timestamp,
          author: { name: s.author_name, icon_url: s.author_icon, url: s.author_url },
          footer: { text: s.footer_text, icon_url: s.footer_icon },
          thumbnail_url: s.thumbnail_url, image_url: s.image_url,
          fields: s.fields,
        } : null,
        buttons: s.buttons.filter((b) => b.label || b.url),
      });
      toast.success("Embed sent!");
    } catch (e: any) {
      toast.error(e?.message || "Could not send the embed.");
    } finally {
      setSending(false);
    }
  };

  const reset = () => { if (confirm("Clear everything?")) { setS({ ...EMPTY, channel_id: s.channel_id }); try { localStorage.removeItem(DRAFT(gid)); } catch { /* ignore */ } } };

  if (loading) return <div className="flex min-h-[400px] items-center justify-center"><RefreshCcw className="h-8 w-8 animate-spin text-primary" /></div>;

  const colorNum = /^#[0-9a-f]{6}$/i.test(s.color) ? s.color : "#2B2D31";
  const selectOptions = channels.map((c) => ({ value: c.id, label: `# ${c.name}` }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-3xl font-bold tracking-tight"><PenLine className="h-7 w-7 text-primary" /> Embed Creator</h2>
          <p className="text-muted-foreground">Design a message, pick a channel and send it. Everything is editable. Your draft is kept in this browser.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={reset} className="gap-2"><RotateCcw className="h-4 w-4" /> Clear</Button>
          <Button onClick={send} disabled={sending} className="gap-2">{sending ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send Embed</Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <Card><CardHeader><CardTitle>Send to</CardTitle><CardDescription>The channel the embed is posted in, and an optional plain message above it.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Channel</Label>
                <Select value={s.channel_id} onValueChange={(v: string) => set("channel_id", v)} options={selectOptions} placeholder="Choose a channel" />
              </div>
              <div className="space-y-2"><Label>Message (optional, shown above the embed)</Label>
                <Textarea className="min-h-[70px]" maxLength={2000} placeholder="Plain text, mentions like <@id> work" {...track("content")} />
              </div>
            </CardContent></Card>

          <Card><CardHeader><CardTitle>Embed</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
                <div className="space-y-2"><Label>Title</Label><Input maxLength={256} {...track("title")} /></div>
                <div className="space-y-2"><Label>Color</Label>
                  <div className="flex gap-2"><input type="color" value={colorNum} onChange={(e) => set("color", e.target.value)} className="h-10 w-12 cursor-pointer rounded border bg-transparent" />
                    <Input value={s.color} onChange={(e) => set("color", e.target.value)} maxLength={7} /></div></div>
              </div>
              <div className="space-y-2"><Label>Title link (optional)</Label><Input placeholder="https://" {...track("url")} /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea className="min-h-[150px]" maxLength={4000} placeholder="Supports **bold**, *italic*, links and variables" {...track("description")} /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Thumbnail image link</Label><Input placeholder="https:// or {server.icon}" {...track("thumbnail_url")} /></div>
                <div className="space-y-2"><Label>Large image link</Label><Input placeholder="https://" {...track("image_url")} /></div>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" checked={s.timestamp} onChange={(e) => set("timestamp", e.target.checked)} /> Show the time it was sent</label>
            </CardContent></Card>

          <Card><CardHeader><CardTitle>Author &amp; Footer</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Author name</Label><Input maxLength={256} {...track("author_name")} /></div>
              <div className="space-y-2"><Label>Author icon link</Label><Input placeholder="https:// or {user.avatar}" {...track("author_icon")} /></div>
              <div className="space-y-2 sm:col-span-2"><Label>Author link</Label><Input placeholder="https://" {...track("author_url")} /></div>
              <div className="space-y-2"><Label>Footer text</Label><Input maxLength={2048} {...track("footer_text")} /></div>
              <div className="space-y-2"><Label>Footer icon link</Label><Input placeholder="https://" {...track("footer_icon")} /></div>
            </CardContent></Card>

          <Card><CardHeader><div className="flex items-center justify-between"><CardTitle>Fields</CardTitle>
            <Button size="sm" variant="outline" disabled={s.fields.length >= 25} className="gap-1" onClick={() => set("fields", [...s.fields, { name: "", value: "", inline: false }])}><Plus className="h-4 w-4" /> Add field</Button></div>
            <CardDescription>Up to 25. Rows left empty are skipped.</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {s.fields.length === 0 && <p className="text-sm text-muted-foreground">No fields yet.</p>}
              {s.fields.map((f, i) => (
                <div key={i} className="space-y-2 rounded-lg border p-3">
                  <div className="flex gap-2">
                    <Input placeholder="Field name" maxLength={256} value={f.name} onChange={(e) => set("fields", s.fields.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
                    <Button size="icon" variant="ghost" onClick={() => set("fields", s.fields.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                  <Textarea placeholder="Field value" maxLength={1024} className="min-h-[60px]" value={f.value} onChange={(e) => set("fields", s.fields.map((x, j) => j === i ? { ...x, value: e.target.value } : x))} />
                  <label className="flex cursor-pointer items-center gap-2 text-xs"><input type="checkbox" checked={f.inline} onChange={(e) => set("fields", s.fields.map((x, j) => j === i ? { ...x, inline: e.target.checked } : x))} /> Show side by side (inline)</label>
                </div>
              ))}
            </CardContent></Card>

          <Card><CardHeader><div className="flex items-center justify-between"><CardTitle>Link buttons</CardTitle>
            <Button size="sm" variant="outline" disabled={s.buttons.length >= 5} className="gap-1" onClick={() => set("buttons", [...s.buttons, { label: "", url: "" }])}><Plus className="h-4 w-4" /> Add button</Button></div>
            <CardDescription>Up to 5 buttons that open a link.</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {s.buttons.length === 0 && <p className="text-sm text-muted-foreground">No buttons.</p>}
              {s.buttons.map((b, i) => (
                <div key={i} className="flex flex-col gap-2 sm:flex-row">
                  <Input placeholder="Label" maxLength={80} value={b.label} onChange={(e) => set("buttons", s.buttons.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
                  <Input placeholder="https://" value={b.url} onChange={(e) => set("buttons", s.buttons.map((x, j) => j === i ? { ...x, url: e.target.value } : x))} />
                  <Button size="icon" variant="ghost" onClick={() => set("buttons", s.buttons.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </CardContent></Card>
        </div>

        <div className="space-y-6 xl:sticky xl:top-4 xl:self-start">
          <Card><CardHeader><CardTitle>Preview</CardTitle><CardDescription>Variables show sample values here. The bot fills in the real ones.</CardDescription></CardHeader>
            <CardContent>
              <div className="rounded-lg bg-[#313338] p-4 text-[#dbdee1]">
                {s.content && <p className="mb-2 whitespace-pre-wrap break-words text-sm">{fill(s.content)}</p>}
                {hasEmbed && (
                  <div className="overflow-hidden rounded border-l-4 bg-[#2b2d31] p-3" style={{ borderLeftColor: colorNum }}>
                    <div className="flex gap-3">
                      <div className="min-w-0 flex-1 space-y-1">
                        {s.author_name && <div className="flex items-center gap-2 text-xs font-semibold">{img(s.author_icon) && <img src={img(s.author_icon)} alt="" className="h-5 w-5 rounded-full" />}{fill(s.author_name)}</div>}
                        {s.title && <div className="break-words font-semibold text-[#00a8fc]">{fill(s.title)}</div>}
                        {s.description && <div className="whitespace-pre-wrap break-words text-sm">{fill(s.description)}</div>}
                        {s.fields.some((f) => f.name && f.value) && (
                          <div className="grid grid-cols-3 gap-2 pt-1">
                            {s.fields.filter((f) => f.name && f.value).map((f, i) => (
                              <div key={i} className={f.inline ? "col-span-1" : "col-span-3"}>
                                <div className="text-xs font-semibold">{fill(f.name)}</div>
                                <div className="whitespace-pre-wrap break-words text-xs">{fill(f.value)}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {img(s.thumbnail_url) && <img src={img(s.thumbnail_url)} alt="" className="h-16 w-16 rounded object-cover" />}
                    </div>
                    {img(s.image_url) && <img src={img(s.image_url)} alt="" className="mt-2 max-h-64 w-full rounded object-cover" />}
                    {(s.footer_text || s.timestamp) && (
                      <div className="mt-2 flex items-center gap-2 text-[11px] text-[#b5bac1]">
                        {img(s.footer_icon) && <img src={img(s.footer_icon)} alt="" className="h-4 w-4 rounded-full" />}
                        {s.footer_text && <span>{fill(s.footer_text)}</span>}
                        {s.footer_text && s.timestamp && <span>•</span>}
                        {s.timestamp && <span>Today</span>}
                      </div>
                    )}
                  </div>
                )}
                {s.buttons.filter((b) => b.label).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {s.buttons.filter((b) => b.label).map((b, i) => <span key={i} className="inline-flex items-center gap-1 rounded bg-[#4e5058] px-3 py-1 text-sm"><Link2 className="h-3 w-3" />{fill(b.label)}</span>)}
                  </div>
                )}
                {!s.content && !hasEmbed && <p className="text-sm text-[#949ba4]">Nothing yet. Start typing on the left.</p>}
              </div>
            </CardContent></Card>

          <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Braces className="h-4 w-4" /> Variables</CardTitle>
            <CardDescription>Click one to insert it into the box you last typed in.</CardDescription></CardHeader>
            <CardContent className="space-y-1.5">
              {vars.map((v) => (
                <button key={v.key} type="button" onClick={() => insertVar(v.key)} className="flex w-full items-center justify-between gap-3 rounded-md border px-3 py-1.5 text-left text-xs transition hover:bg-primary/10">
                  <code className="font-semibold">{v.key}</code><span className="text-muted-foreground">{v.description}</span>
                </button>
              ))}
            </CardContent></Card>
        </div>
      </div>
    </div>
  );
}
