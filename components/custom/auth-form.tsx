import Form from 'next/form';

import { Input } from '../ui/input';
import { Label } from '../ui/label';

export function AuthForm({
  action,
  children,
  defaultEmail = '',
}: {
  action: any;
  children: React.ReactNode;
  defaultEmail?: string;
}) {
  return (
    <Form action={action} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Email Address
          </Label>

          <Input
            id="email"
            name="email"
            className="h-11 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
            type="email"
            placeholder="Enter your email"
            autoComplete="email"
            required
            autoFocus
            defaultValue={defaultEmail}
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Password
          </Label>

          <Input
            id="password"
            name="password"
            className="h-11 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
            type="password"
            placeholder="Enter your password"
            required
          />
        </div>
      </div>

      {children}
    </Form>
  );
}
