export interface GoogleButtonProps {
  onClick(): void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  className?: string;
}
