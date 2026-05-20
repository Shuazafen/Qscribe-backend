import Link from "next/link"
import { Button } from "./ui/button"
import Nav from "./Nav";


const Header = () => {
    return (
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border py-4 xl:py-6 transition-all">
            <div className="container mx-auto px-4 flex justify-between items-center">

            <Link href={"/"} className="font-bold text-3xl tracking-tight flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            QSCRIBE
            </Link>

            {/* Desktop nav bar */}
            <div className="xl:flex items-center flex-1">
                <Nav />
            </div>

            {/* Mobile Nav Placeholder */}
            <div className="xl:hidden">
              {/* Add MobileNav component here later if needed */}
            </div>

            </div>
        </header>
    )
}

export default Header