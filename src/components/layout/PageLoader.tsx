const PageLoader = () => {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-primary"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
};

export default PageLoader;