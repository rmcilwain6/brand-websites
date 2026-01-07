import type { ReactNode } from 'react';

export type CardProps = {
  title?: string;
  children: ReactNode;
  className?: string;
};

export const Card = ({ title, children, className }: CardProps) => {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-6 shadow-sm ${
        className ?? ''
      }`}
    >
      {title ? <h3 className="text-lg font-semibold text-gray-900">{title}</h3> : null}
      <div className={title ? 'mt-3 text-sm text-gray-600' : 'text-sm text-gray-600'}>
        {children}
      </div>
    </div>
  );
};
