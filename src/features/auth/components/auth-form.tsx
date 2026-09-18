"use client";

import Link from "next/link";
import { useActionState } from "react";

import { LoaderCircle } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

import { iniciarSesion, registrarse } from "../actions";
import { authStateInicial, type AuthState } from "../state";

type Modo = "login" | "registro";

const COPY = {
  login: {
    submit: "Entrar",
    submitting: "Entrando…",
    pie: "¿No tenés cuenta?",
    pieLink: "Creá una",
    pieHref: "/registro",
  },
  registro: {
    submit: "Crear cuenta",
    submitting: "Creando cuenta…",
    pie: "¿Ya tenés cuenta?",
    pieLink: "Iniciá sesión",
    pieHref: "/login",
  },
} as const;

export function AuthForm({
  modo,
  redirectTo,
}: {
  modo: Modo;
  redirectTo?: string;
}) {
  const accion = modo === "login" ? iniciarSesion : registrarse;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    accion,
    authStateInicial,
  );
  const copy = COPY[modo];

  return (
    <form action={formAction} className="space-y-5">
      {redirectTo ? (
        <input type="hidden" name="redirectTo" value={redirectTo} />
      ) : null}

      {state.error ? <Alert tone="error">{state.error}</Alert> : null}
      {state.aviso ? <Alert tone="exito">{state.aviso}</Alert> : null}

      <Field htmlFor="email" label="Email">
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.email}
          placeholder="tu@email.com"
          invalid={Boolean(state.error)}
        />
      </Field>

      <Field
        htmlFor="password"
        label="Contraseña"
        hint={modo === "registro" ? "Mínimo 8 caracteres." : undefined}
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={modo === "login" ? "current-password" : "new-password"}
          required
          minLength={8}
          placeholder="••••••••"
        />
      </Field>

      {modo === "registro" ? (
        <Field htmlFor="password_confirmacion" label="Repetir contraseña">
          <Input
            id="password_confirmacion"
            name="password_confirmacion"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="••••••••"
          />
        </Field>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full" size="lg">
        {pending ? (
          <>
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            {copy.submitting}
          </>
        ) : (
          copy.submit
        )}
      </Button>

      <p className="text-center text-sm text-ink-soft">
        {copy.pie}{" "}
        <Link
          href={copy.pieHref}
          className="font-medium text-ink underline underline-offset-4 hover:text-busco"
        >
          {copy.pieLink}
        </Link>
      </p>
    </form>
  );
}
