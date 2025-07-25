import { Separator } from "@radix-ui/react-separator";
import React from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

type Props = {
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  errors: Record<string, string[]>;
  isLoading: boolean;
};

export default function LoginPage({ handleSubmit, errors, isLoading }: Props) {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <Card className="flex w-full max-w-md flex-col">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">ログイン</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="taro@example.com"
                aria-invalid={errors?.email ? true : undefined}
                disabled={isLoading}
              />
              {errors?.email && (
                <p className="text-destructive text-sm">{errors.email.at(0)}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                name="password"
                type="password"
                aria-invalid={errors?.password ? true : undefined}
                disabled={isLoading}
              />
              {errors?.password && (
                <p className="text-destructive text-sm">
                  {errors.password.at(0)}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "ログイン中..." : "ログイン"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t pt-6">
          <div className="text-muted-foreground text-center text-sm">
            アカウントをお持ちでないですか？{" "}
            <a
              href="/signup"
              className="text-primary hover:text-primary/90 underline"
            >
              アカウント作成
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
