
export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="py-4 px-4 sm:px-6 text-center text-muted-foreground text-sm border-t">
      <div className="container mx-auto">
        <div className="flex justify-center items-center space-x-4">
          <p>&copy; {currentYear} HegGeo. All rights reserved.</p>
          <a href="https://heggie.netlify.app/" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1">
            <img src="https://heggie.netlify.app/favicon.ico" alt="HeggieHub Favicon" className="h-4 w-4" />
            <span>HeggieHub</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

