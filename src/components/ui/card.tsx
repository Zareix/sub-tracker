import type * as React from 'react';

import { cn } from '~/lib/utils';

const Card = ({ className, ...props }: React.ComponentProps<'div'>) => (
  <div
    className={cn(
      'rounded-lg border bg-card px-4 py-3 text-card-foreground shadow-xs',
      className
    )}
    {...props}
  />
);

const CardHeader = ({ className, ...props }: React.ComponentProps<'div'>) => (
  <div className={cn('flex flex-col space-y-1.5', className)} {...props} />
);

const CardTitle = ({ className, ...props }: React.ComponentProps<'div'>) => (
  <div
    className={cn(
      'font-semibold text-2xl leading-none tracking-tight',
      className
    )}
    {...props}
  />
);

const CardDescription = ({
  className,
  ...props
}: React.ComponentProps<'div'>) => (
  <div className={cn('text-muted-foreground text-sm', className)} {...props} />
);

const CardContent = ({ className, ...props }: React.ComponentProps<'div'>) => (
  <div className={cn(className)} {...props} />
);

const CardFooter = ({ className, ...props }: React.ComponentProps<'div'>) => (
  <div className={cn('flex items-center p-6 pt-0', className)} {...props} />
);

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
