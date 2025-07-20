
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const products = [
    { id: 1, name: "Comprehensive GPAT Guide", category: "Books", price: "₹1,299", imageUrl: "/assets/product-book-gpat.png", dataAiHint: "book cover", affiliate: true, link: "#" },
    { id: 2, name: "Pharmaceutics PDF Bundle", category: "Bundles", price: "₹499", imageUrl: "/assets/product-bundle-pharma.png", dataAiHint: "documents pile", affiliate: false, link: "#" },
    { id: 3, name: "Pharmacology Masterclass", category: "Courses", price: "₹2,499", imageUrl: "/assets/product-course-pharma.png", dataAiHint: "online course", affiliate: true, link: "#" },
    { id: 4, name: "Medicinal Chemistry Notes", category: "Bundles", price: "₹399", imageUrl: "/assets/product-bundle-chem.png", dataAiHint: "chemistry notes", affiliate: false, link: "#" },
    { id: 5, name: "Wilson and Gisvold's Textbook", category: "Books", price: "₹1,850", imageUrl: "/assets/product-book-wilson.png", dataAiHint: "textbook", affiliate: true, link: "#" },
];

const ProductCard = ({ product }: { product: typeof products[0] }) => (
    <Card className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="p-0">
            <div className="relative h-48 w-full">
                <Image src={product.imageUrl} alt={product.name} fill className="object-cover" data-ai-hint={product.dataAiHint} />
            </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
            <Badge variant="secondary" className="mb-2">{product.category}</Badge>
            <CardTitle className="font-headline text-lg">{product.name}</CardTitle>
            <p className="text-2xl font-bold text-primary mt-2">{product.price}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
            <Button asChild className="w-full">
                <Link href={product.link} target="_blank" rel="noopener noreferrer">View Product</Link>
            </Button>
        </CardFooter>
    </Card>
);

export default function StorePage() {
    const categories = ["All", "Books", "Courses", "Bundles"];
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-headline font-bold">Store</h1>
                <p className="text-muted-foreground">Curated study materials to accelerate your learning.</p>
            </div>
            <Tabs defaultValue="All" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                    {categories.map(category => <TabsTrigger key={category} value={category}>{category}</TabsTrigger>)}
                </TabsList>
                
                {categories.map(category => (
                    <TabsContent key={category} value={category}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
                           {(category === "All" ? products : products.filter(p => p.category === category)).map(product => (
                               <ProductCard key={product.id} product={product} />
                           ))}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
