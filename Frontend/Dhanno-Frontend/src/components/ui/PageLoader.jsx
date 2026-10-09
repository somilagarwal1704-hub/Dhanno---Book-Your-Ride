const PageLoader = ({ label = "Loading..." }) => (
  <div className="grid min-h-screen place-items-center bg-canvas text-ink">
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-12 w-12">
        <span className="absolute inset-0 animate-ping rounded-full bg-brand/40" />
        <span className="absolute inset-2 rounded-full bg-brand" />
      </div>
      <p className="text-sm text-ink-2">{label}</p>
    </div>
  </div>
);

export default PageLoader;
