"use client";

import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SponsorForm() {
  const submit = useMutation(api.sponsorInquiries.submit);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await submit({ name, email, message });
      setDone(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <p className="rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
        Thanks — we received your message and will get back to you soon.
      </p>
    );
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="mt-8 max-w-md space-y-4">
      <div className="space-y-2">
        <label htmlFor="sponsor-name" className="text-sm font-medium text-primary">
          Name
        </label>
        <Input
          id="sponsor-name"
          name="name"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={200}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="sponsor-email" className="text-sm font-medium text-primary">
          Email
        </label>
        <Input
          id="sponsor-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={320}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="sponsor-message" className="text-sm font-medium text-primary">
          Message
        </label>
        <textarea
          id="sponsor-message"
          name="message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={8000}
          className="w-full min-w-0 rounded-lg border border-outline-variant bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-on-surface-variant focus-visible:border-tms-orange focus-visible:ring-3 focus-visible:ring-tms-orange/30 md:text-sm"
        />
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" variant="brand" disabled={pending}>
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
