"use client";

import { Toaster as Sonner } from "sonner";
import type React from "react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = (props: ToasterProps) => {
  return <Sonner {...props} />;
};

export { Toaster };
