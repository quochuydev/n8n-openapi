interface SampleButtonProps {
  name: string;
  onClick: () => void;
}

export function SampleButton({ name, onClick }: SampleButtonProps) {
  return (
    <button
      className="btn btn-sm btn-outline"
      onClick={onClick}
    >
      {name}
    </button>
  );
}
