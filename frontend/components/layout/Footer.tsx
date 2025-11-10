export function Footer() {
  return (
    <footer className="border-t border-white/10 mt-16 py-10 text-center text-sm text-white/60">
      <div className="max-w-6xl mx-auto px-6">
        © {new Date().getFullYear()} Guardian. All rights reserved.
      </div>
    </footer>
  );
}
