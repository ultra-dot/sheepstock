"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { login } from "@/app/actions/auth"
import { useActionState } from "react"
import { AlertCircle } from "lucide-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  // @ts-ignore - Ignore type error for useActionState in Next.js 14/15 if types are lagging
  const [state, formAction, isPending] = useActionState(login, null)

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" action={formAction}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center mb-4">
                <div className="flex items-center gap-2 font-bold text-xl text-primary mb-2">
                  <span>MitraTani Farm</span>
                </div>
                <h1 className="text-2xl font-bold">Login</h1>
                <p className="text-balance text-muted-foreground">
                  Masukan kredensial akun SheepStock
                </p>
              </div>

              {state?.error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {state.error}
                </div>
              )}

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@mitratanifarm.com"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Lupa password?
                  </a>
                </div>
                <Input id="password" name="password" type="password" required />
              </Field>
              <Field>
                <Button type="submit" className="w-full mt-2" disabled={isPending}>
                  {isPending ? "Memproses..." : "Masuk"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
          <div className="relative hidden bg-muted md:block">
            {/* You can replace this src with a real farm image later */}
            <img
              src="https://images.unsplash.com/photo-1484557985045-8f55e09f7a75?q=80&w=1968&auto=format&fit=crop"
              alt="Farm"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2]"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        Dengan masuk, Anda menyetujui <a href="#">Syarat Layanan</a>{" "}
        dan <a href="#">Kebijakan Privasi</a> kami.
      </FieldDescription>
    </div>
  )
}
