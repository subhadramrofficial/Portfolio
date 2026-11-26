export default function SectionHeading({ id, eyebrow, title, children }) {
  return (
    <div className="mb-10">
      <span className="eyebrow">{eyebrow}</span>
      <h2 id={id} className="text-2xl font-semibold sm:text-3xl">
        {title}
      </h2>
      {children && <p className="mt-2 max-w-xl text-inkSoft">{children}</p>}
    </div>
  );
}
