import { notFound } from "next/navigation";
import { getPropertyDetailsById } from "@/src/actions/hanap-bahay/property-details-action";
import { PropertyDetailsClient } from "@/src/components/hanap-bahay/details/PropertyDetailsClient";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function PropertyDetailsPage({ params }: PageProps) {
    const resolvedParams = await params;
    const data = await getPropertyDetailsById(resolvedParams.id);

    if (!data) {
        notFound();
    }

    return <PropertyDetailsClient property={data.property} units={data.units} />;
}