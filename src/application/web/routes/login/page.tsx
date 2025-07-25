import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Form } from "./form";

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
          <Form
            isLoading={isLoading}
            errors={errors}
            handleSubmit={handleSubmit}
          />
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
