
'use server';

import { promises as fs } from 'fs';
import path from 'path';

const buyerPagePath = path.join(process.cwd(), 'src', 'app', 'buyer', 'page.tsx');

interface CarouselSlide {
  title: string;
  description: string;
  buttonText: string;
  imageUrl: string;
}

interface CategoryImage {
  name: string;
  url: string;
  hint: string;
}

interface DashboardConfig {
  carouselSlides: CarouselSlide[];
  categoryImages: CategoryImage[];
}

// Function to generate the <CarouselContent> block dynamically
function generateCarouselContent(slides: CarouselSlide[]): string {
    const slideItems = slides.map((slide, index) => {
        const hint = slide.title.toLowerCase().split(' ').slice(0, 2).join(' ');
        const link = `/buyer?category=${encodeURIComponent(slide.title.replace(/ /g, '+'))}`
        return `
                <CarouselItem>
                  <div className="relative h-[50vh] md:h-[70vh] w-full">
                    <Image src="${slide.imageUrl}" alt="Slide ${index + 1}" fill className="object-cover" data-ai-hint="${hint}"/>
                     <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center text-white p-4">
                        <h2 className="text-4xl md:text-6xl font-headline font-bold">${slide.title}</h2>
                        <p className="mt-4 text-lg">${slide.description}</p>
                        <Button asChild size="lg" className="mt-6">
                            <Link href="${link}">${slide.buttonText}</Link>
                        </Button>
                    </div>
                  </div>
                </CarouselItem>`;
    }).join('');

    return `<CarouselContent>${slideItems}
              </CarouselContent>`;
}

// Function to generate the CategoryCards component dynamically
function generateCategoryCards(categories: CategoryImage[]): string {
    const categoryItems = categories.map(cat => `
        { name: '${cat.name.replace(/'/g, "\\'")}', image: '${cat.url}', hint: '${cat.hint.replace(/'/g, "\\'")}' },`).join('');

    return `function CategoryCards() {
    const router = useRouter();

    const handleCategoryClick = (categoryName: string) => {
        router.push(\`/buyer?category=\${encodeURIComponent(categoryName)}\`);
    }
    
    const displayCategories = [${categoryItems}
    ];

    return (
        <div className="py-12">
            <h2 className="font-headline text-3xl font-bold text-center mb-8">Shop by Category</h2>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {displayCategories.map((category, index) => (
                    <div
                        key={index}
                        onClick={() => handleCategoryClick(category.name)}
                        className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group border-2 border-transparent hover:border-primary transition-all"
                    >
                         <Image
                            src={category.image}
                            alt={category.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                            data-ai-hint={category.hint}
                        />
                        <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition-colors flex items-center justify-center p-2">
                            <h3 className="text-white text-center font-semibold text-lg">{category.name}</h3>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}`;
}

export async function updateDashboard(config: DashboardConfig) {
  try {
    let buyerPageContent = await fs.readFile(buyerPagePath, 'utf-8');

    // --- Dynamically replace the CarouselContent block ---
    const newCarouselContent = generateCarouselContent(config.carouselSlides);
    const carouselRegex = /<CarouselContent>[\s\S]*?<\/CarouselContent>/;
    if (buyerPageContent.match(carouselRegex)) {
        buyerPageContent = buyerPageContent.replace(carouselRegex, newCarouselContent);
    } else {
        // Fallback or error if the block is not found
        console.warn("CarouselContent block not found in buyer page.");
    }

    // --- Dynamically replace the CategoryCards component ---
    const newCategoryCards = generateCategoryCards(config.categoryImages);
    const categoryCardsRegex = /function CategoryCards\(\) {[\s\S]*?}/;
    if (buyerPageContent.match(categoryCardsRegex)) {
        buyerPageContent = buyerPageContent.replace(categoryCardsRegex, newCategoryCards);
    } else {
         console.warn("CategoryCards function not found in buyer page.");
    }
    
    await fs.writeFile(buyerPagePath, buyerPageContent, 'utf-8');
    
    return { success: true, message: 'Buyer homepage updated successfully.' };
  } catch (error) {
    console.error('Failed to update dashboard:', error);
    if (error instanceof Error) {
        throw new Error(`Failed to update buyer page: ${error.message}`);
    }
    throw new Error('An unknown error occurred while updating the dashboard.');
  }
}
