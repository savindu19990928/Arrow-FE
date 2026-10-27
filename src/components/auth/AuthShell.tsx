import React from 'react';

export const STORY_IMAGE = "/1c091e63-928f-4f45-9305-edc730916228.jpg";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="grid min-h-[calc(100vh-92px)] bg-canvas lg:grid-cols-2">
      <div className="flex items-center justify-center px-5 py-14 md:px-10">
        <div className="w-full max-w-md">
          <h1 className="display text-[44px] md:text-[56px]">{title}</h1>
          <p className="mt-3 text-[16px] text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
      <div className="relative hidden lg:block">
        <img src={STORY_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover" />
      </div>
    </div>);

}