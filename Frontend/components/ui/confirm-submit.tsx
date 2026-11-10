"use client";

import type { MouseEvent, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import type { ButtonProps } from "@/components/ui/button";

type ConfirmSubmitProps = Omit<ButtonProps, "type"> & {
  confirmation: string;
  children: ReactNode;
};

export const ConfirmSubmit = ({
  confirmation,
  children,
  onClick,
  ...props
}: ConfirmSubmitProps) => {
  const confirmClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented && !window.confirm(confirmation)) {
      event.preventDefault();
    }
  };

  return (
    <Button {...props} type="submit" onClick={confirmClick}>
      {children}
    </Button>
  );
};
