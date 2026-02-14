import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h3 className="font-semibold">SuiPatron</h3>
            <p className="text-sm text-muted-foreground">
              Support creators. Own your content. No platform fees.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-sm">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/explore"
                  className="hover:text-foreground transition-colors"
                >
                  Explore Creators
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="hover:text-foreground transition-colors"
                >
                  Become a Creator
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-sm">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  How it Works
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Creator Guide
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© 2025 SuiPatron. Creator-owned content platform.</p>
        </div>
      </div>
    </footer>
  );
}
