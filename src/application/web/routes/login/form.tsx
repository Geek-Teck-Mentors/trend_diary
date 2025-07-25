import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

type Props = {
  isLoading: boolean;
  errors: Record<string, string[]>;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export const Form = ({ isLoading, errors, handleSubmit }: Props) => {
  return (
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
          <p className="text-destructive text-sm">{errors.password.at(0)}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "ログイン中..." : "ログイン"}
      </Button>
    </form>
  );
};
