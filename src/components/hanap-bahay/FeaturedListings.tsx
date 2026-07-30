import Link from "next/link";
import { Button } from "@/src/components/Button";

const SAMPLE_PROPERTIES = [
    { id: "sunshine", name: "Sunshine Residences", location: "Sampaloc, Manila", price: "₱5,500 / buwan", status: "Vacant" },
    { id: "greenfields", name: "Greenfields Apartment", location: "Quezon City", price: "₱8,000 / buwan", status: "Available Soon" },
    { id: "metro-loft", name: "Metro Loft Units", location: "Mandaluyong City", price: "₱12,000 / buwan", status: "Vacant" },
];

export function FeaturedListings() {
    return (
        <section id="listings" className="py-16 flex-1">
            <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
                    <div>
                        <h2 className="font-display text-2xl sm:text-3xl font-bold">Mga Bagong Bakanteng Unit</h2>
                        <p className="text-forest/70 text-sm sm:text-base mt-1">Silipin ang mga beripikadong ari-arian mula sa aming mga pinagkakatiwalaang landlord.</p>
                    </div>
                    <Link href="/hanap-bahay/search" className="text-sm font-semibold text-marigold-deep hover:underline mt-2 md:mt-0">
                        Tingnan ang lahat &rarr;
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {SAMPLE_PROPERTIES.map((p) => (
                        <div key={p.id} className="rounded-2xl border border-line bg-paper-card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="h-48 bg-forest/10 flex items-center justify-center text-forest/40 font-medium">
                                Cover Photo
                            </div>
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-display text-lg font-bold">{p.name}</h3>
                                    <span className="rounded-full bg-forest/10 px-2.5 py-1 text-xs font-bold text-forest">{p.status}</span>
                                </div>
                                <p className="text-xs text-forest/70 mb-4">{p.location}</p>
                                <div className="flex items-center justify-between border-t border-line pt-4">
                                    <div>
                                        <span className="text-xs text-forest/70 block">Magsimula sa</span>
                                        <span className="font-display text-base font-extrabold text-forest-deep">{p.price}</span>
                                    </div>
                                    <Button href={`/hanap-bahay/${p.id}`} variant="secondary" className="!px-4 !py-2 !text-xs">
                                        Tingnan
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}