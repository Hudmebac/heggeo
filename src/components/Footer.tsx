export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="py-4 px-4 sm:px-6 text-center text-muted-foreground text-sm border-t">
      <div className="container mx-auto">
        <p>&copy; {currentYear} HegGeo. All rights reserved.</p>
        <p className="mt-1">
          Share your moments, mark your spots.
        </p>
      </div>
    </footer>
  );
}
