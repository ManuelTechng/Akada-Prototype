import React from 'react'
import { cn } from '../../lib/utils'

interface TypographyProps {
  children: React.ReactNode
  className?: string
  [key: string]: any
}

export const Typography = {
  H1: ({ children, className, ...props }: TypographyProps) => (
    <h1 
      className={cn("text-4xl font-bold tracking-tight text-foreground", className)} 
      {...props}
    >
      {children}
    </h1>
  ),
  
  H2: ({ children, className, ...props }: TypographyProps) => (
    <h2 
      className={cn("text-3xl font-semibold tracking-tight text-foreground", className)} 
      {...props}
    >
      {children}
    </h2>
  ),
  
  H3: ({ children, className, ...props }: TypographyProps) => (
    <h3 
      className={cn("text-2xl font-semibold tracking-tight text-foreground", className)} 
      {...props}
    >
      {children}
    </h3>
  ),
  
  H4: ({ children, className, ...props }: TypographyProps) => (
    <h4 
      className={cn("text-xl font-semibold tracking-tight text-foreground", className)} 
      {...props}
    >
      {children}
    </h4>
  ),
  
  H5: ({ children, className, ...props }: TypographyProps) => (
    <h5 
      className={cn("text-lg font-semibold tracking-tight text-foreground", className)} 
      {...props}
    >
      {children}
    </h5>
  ),
  
  H6: ({ children, className, ...props }: TypographyProps) => (
    <h6 
      className={cn("text-base font-semibold tracking-tight text-foreground", className)} 
      {...props}
    >
      {children}
    </h6>
  ),
  
  Body: ({ children, className, ...props }: TypographyProps) => (
    <p 
      className={cn("text-base leading-7 text-foreground", className)} 
      {...props}
    >
      {children}
    </p>
  ),
  
  Small: ({ children, className, ...props }: TypographyProps) => (
    <p 
      className={cn("text-sm text-muted-foreground", className)} 
      {...props}
    >
      {children}
    </p>
  ),
  
  Caption: ({ children, className, ...props }: TypographyProps) => (
    <p 
      className={cn("text-xs text-muted-foreground", className)} 
      {...props}
    >
      {children}
    </p>
  ),
  
  Lead: ({ children, className, ...props }: TypographyProps) => (
    <p 
      className={cn("text-lg text-muted-foreground", className)} 
      {...props}
    >
      {children}
    </p>
  ),
  
  Large: ({ children, className, ...props }: TypographyProps) => (
    <p 
      className={cn("text-lg font-semibold text-foreground", className)} 
      {...props}
    >
      {children}
    </p>
  ),
  
  Muted: ({ children, className, ...props }: TypographyProps) => (
    <p 
      className={cn("text-sm text-muted-foreground", className)} 
      {...props}
    >
      {children}
    </p>
  ),
  
  Code: ({ children, className, ...props }: TypographyProps) => (
    <code 
      className={cn("relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold", className)} 
      {...props}
    >
      {children}
    </code>
  ),
  
  Blockquote: ({ children, className, ...props }: TypographyProps) => (
    <blockquote 
      className={cn("mt-6 border-l-2 pl-6 italic text-muted-foreground", className)} 
      {...props}
    >
      {children}
    </blockquote>
  ),
  
  List: ({ children, className, ...props }: TypographyProps) => (
    <ul 
      className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)} 
      {...props}
    >
      {children}
    </ul>
  ),
  
  InlineCode: ({ children, className, ...props }: TypographyProps) => (
    <code 
      className={cn("relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm", className)} 
      {...props}
    >
      {children}
    </code>
  ),
}

