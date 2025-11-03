import Navbar from '../Navbar';
import { Router } from 'wouter';

export default function NavbarExample() {
  return (
    <Router>
      <div className="bg-background min-h-screen">
        <Navbar />
        <div className="p-8">
          <h1 className="text-2xl font-bold">Navigate using the navbar above</h1>
          <p className="text-muted-foreground mt-2">Click through the different sections to see the active state</p>
        </div>
      </div>
    </Router>
  );
}
