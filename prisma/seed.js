const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const serializeArray = (arr) => JSON.stringify(arr || []);

const prisma = new PrismaClient();

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

const categories = [
  { name: 'Colliers', description: 'Colliers élégants en acier inoxydable' },
  { name: 'Bagues', description: 'Bagues raffinées pour toutes les occasions' },
  { name: 'Bracelets', description: 'Bracelets lumineux et intemporels' },
  { name: "Boucles d'oreilles", description: "Boucles d'oreilles parisiennes" },
  { name: 'Parures', description: 'Parures assorties pour un look complet' },
  { name: 'Piercings', description: 'Piercings délicats en acier inoxydable' },
];

const collections = [
  { name: 'Parisienne', description: "L'esprit de Paris, l'élégance française" },
  { name: 'Élégance', description: 'La sophistication à l\'état pur' },
  { name: 'Intemporelle', description: 'Des pièces qui traversent le temps' },
  { name: 'Lumière', description: 'Des créations qui brillent de mille feux' },
];

const products = [
  {
    name: 'Collier Étoile Dorée',
    description: 'Un collier délicat orné d\'une étoile scintillante en acier inoxydable doré. Parfait pour ajouter une touche de lumière à votre tenue quotidienne. Le pendentif étoile symbolise l\'élégance et le rêve parisien.',
    shortDescription: 'Collier avec pendentif étoile doré',
    price: 39.90,
    compareAtPrice: 49.90,
    color: 'Doré',
    sizes: ['40cm', '45cm', '50cm'],
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    categoryIndex: 0,
    collectionIndex: 2,
  },
  {
    name: 'Bague Lumière',
    description: 'Une bague fine et lumineuse en acier inoxydable argenté. Son design épuré capture la lumière et illumine votre main avec une élégance discrète. Inspirée des nuits parisiennes.',
    shortDescription: 'Bague fine argentée lumineuse',
    price: 24.90,
    compareAtPrice: null,
    color: 'Argenté',
    sizes: ['52', '54', '56', '58', '60'],
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    categoryIndex: 1,
    collectionIndex: 1,
  },
  {
    name: 'Bracelet Élégance',
    description: 'Un bracelet raffiné en acier inoxydable doré, tressé avec délicatesse. Ce bracelet apporte une touche de sophistication à chaque mouvement. Un incontournable pour la femme moderne.',
    shortDescription: 'Bracelet tressé doré élégant',
    price: 34.90,
    compareAtPrice: 44.90,
    color: 'Doré',
    sizes: ['16cm', '18cm', '20cm'],
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    categoryIndex: 2,
    collectionIndex: 0,
  },
  {
    name: 'Boucles Soleil',
    description: 'Des boucles d\'oreilles créoles en acier inoxydable doré. Leur forme solaire illumine votre visage avec éclat. Légères et confortables pour un port quotidien.',
    shortDescription: 'Créoles dorées soleil',
    price: 29.90,
    compareAtPrice: null,
    color: 'Doré',
    sizes: [],
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    categoryIndex: 3,
    collectionIndex: 3,
  },
  {
    name: 'Collier Perle Parisienne',
    description: 'Un collier raffiné mêlant l\'acier inoxydable doré à une perle lumineuse. Une pièce d\'inspiration parisienne qui évoque l\'élégance intemporelle des femmes de la capitale.',
    shortDescription: 'Collier avec perle et chaîne dorée',
    price: 49.90,
    compareAtPrice: 59.90,
    color: 'Doré',
    sizes: ['40cm', '45cm'],
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    categoryIndex: 0,
    collectionIndex: 0,
  },
  {
    name: 'Bague Intemporelle',
    description: 'Une bague classique en acier inoxydable argenté, au design intemporel. Sa simplicité sophistiquée en fait la bague parfaite pour toutes les occasions, du quotidien aux grandes soirées.',
    shortDescription: 'Bague classique argentée intemporelle',
    price: 19.90,
    compareAtPrice: null,
    color: 'Argenté',
    sizes: ['52', '54', '56', '58', '60'],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    categoryIndex: 1,
    collectionIndex: 2,
  },
  {
    name: 'Bracelet Riviera',
    description: 'Un bracelet chaîne en acier inoxydable doré, inspiré de la Riviera française. Élégant et lumineux, il évoque le soleil de la Côte d\'Azur. Un bijou qui respire la joie de vivre.',
    shortDescription: 'Bracelet chaîne doré Riviera',
    price: 44.90,
    compareAtPrice: 54.90,
    color: 'Doré',
    sizes: ['17cm', '19cm', '21cm'],
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: false,
    categoryIndex: 2,
    collectionIndex: 3,
  },
  {
    name: 'Boucles Aurora',
    description: 'Des boucles d\'oreilles pendantes en acier inoxydable argenté, ornées de strass scintillants. Comme les aurores boréales, elles captent la lumière et la reflètent avec magie.',
    shortDescription: 'Boucles pendantes argentées strass',
    price: 35.90,
    compareAtPrice: null,
    color: 'Argenté',
    sizes: [],
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    categoryIndex: 3,
    collectionIndex: 3,
  },
  {
    name: 'Collier Cœur Élégant',
    description: 'Un collier romantique avec un pendentif cœur en acier inoxydable doré. Un symbole d\'amour et d\'élégance, parfait pour offrir ou pour se faire plaisir.',
    shortDescription: 'Collier pendentif cœur doré',
    price: 42.90,
    compareAtPrice: 52.90,
    color: 'Doré',
    sizes: ['40cm', '45cm'],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    categoryIndex: 0,
    collectionIndex: 1,
  },
  {
    name: 'Bague Minimaliste',
    description: 'Une bague fine et minimaliste en acier inoxydable argenté. Son design discret et épuré s\'adapte à tous les styles. La bague idéale pour un look chic et moderne.',
    shortDescription: 'Bague fine minimaliste argentée',
    price: 19.90,
    compareAtPrice: null,
    color: 'Argenté',
    sizes: ['50', '52', '54', '56', '58', '60'],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    categoryIndex: 1,
    collectionIndex: 2,
  },
  {
    name: 'Bracelet Amour',
    description: 'Un bracelet romantique en acier inoxydable doré avec un charm cœur. Un bijou chargé de sens, parfait pour exprimer vos sentiments avec élégance.',
    shortDescription: 'Bracelet charm cœur doré',
    price: 32.90,
    compareAtPrice: 39.90,
    color: 'Doré',
    sizes: ['16cm', '18cm', '20cm'],
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    categoryIndex: 2,
    collectionIndex: 0,
  },
  {
    name: 'Boucles Nacre',
    description: 'Des boucles d\'oreilles en acier inoxydable doré avec des incrustations nacrées. La nacre apporte une touche de douceur et de féminité, rappelant la beauté des perles.',
    shortDescription: 'Boucles nacrées dorées',
    price: 38.90,
    compareAtPrice: null,
    color: 'Doré',
    sizes: [],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    categoryIndex: 3,
    collectionIndex: 1,
  },
  {
    name: 'Collier Élora',
    description: 'Le collier signature Élora, une pièce maîtresse en acier inoxydable doré. Son design unique mêle maillons fins et pendentif gravé. Un bijou qui porte le nom de la marque avec fierté.',
    shortDescription: 'Collier signature Élora doré',
    price: 59.90,
    compareAtPrice: 79.90,
    color: 'Doré',
    sizes: ['42cm', '47cm'],
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    categoryIndex: 0,
    collectionIndex: 0,
  },
  {
    name: 'Bague Madeleine',
    description: 'Une bague délicate en acier inoxydable rose gold, ornée d\'une petite fleur. Inspirée des madeleines de Proust, elle évoque la douceur et les souvenirs précieux.',
    shortDescription: 'Bague fleur rose gold',
    price: 26.90,
    compareAtPrice: null,
    color: 'Rose Gold',
    sizes: ['52', '54', '56', '58'],
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    categoryIndex: 1,
    collectionIndex: 1,
  },
  {
    name: 'Bracelet Vendôme',
    description: 'Un bracelet rigide en acier inoxydable doré, inspiré de la place Vendôme à Paris. Son design original et structuré apporte une touche d\'audace à votre poignet.',
    shortDescription: 'Bracelet rigide doré Vendôme',
    price: 54.90,
    compareAtPrice: 64.90,
    color: 'Doré',
    sizes: ['S', 'M', 'L'],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    categoryIndex: 2,
    collectionIndex: 0,
  },
  {
    name: 'Boucles Opéra',
    description: 'Des boucles d\'oreilles luxueuses en acier inoxydable doré, inspirées de l\'Opéra Garnier. Leur design travaillé évoque la grandeur et l\'élégance des soirs d\'opéra parisiens.',
    shortDescription: 'Boucles luxueuses dorées Opéra',
    price: 45.90,
    compareAtPrice: null,
    color: 'Doré',
    sizes: [],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    categoryIndex: 3,
    collectionIndex: 1,
  },
  {
    name: 'Collier Montmartre',
    description: 'Un collier bohème en acier inoxydable argenté avec un pendentif artistique. Inspiré du quartier de Montmartre, il capture l\'esprit créatif et libre de Paris.',
    shortDescription: 'Collier bohème argenté Montmartre',
    price: 36.90,
    compareAtPrice: null,
    color: 'Argenté',
    sizes: ['40cm', '45cm', '50cm'],
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    categoryIndex: 0,
    collectionIndex: 0,
  },
  {
    name: 'Bague Champs-Élysées',
    description: 'Une bague élégante en acier inoxydable doré, ornée de lignes fines et élégantes qui évoquent l\'avenue des Champs-Élysées. Un bijou qui rayonne de prestige.',
    shortDescription: 'Bague dorée Champs-Élysées',
    price: 29.90,
    compareAtPrice: null,
    color: 'Doré',
    sizes: ['52', '54', '56', '58'],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    categoryIndex: 1,
    collectionIndex: 3,
  },
  {
    name: 'Bracelet Louvre',
    description: 'Un bracelet artistique en acier inoxydable argenté, dont le maillage évoque la pyramide du Louvre. Un hommage à l\'art et à la culture parisienne.',
    shortDescription: 'Bracelet artistique argenté Louvre',
    price: 39.90,
    compareAtPrice: null,
    color: 'Argenté',
    sizes: ['17cm', '19cm', '21cm'],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    categoryIndex: 2,
    collectionIndex: 0,
  },
  {
    name: 'Boucles Paris Nuit',
    description: 'Des boucles d\'oreilles mystérieuses en acier inoxydable argenté, ornées de cristaux scintillants. Elles évoquent la magie et la lumière de Paris la nuit.',
    shortDescription: 'Boucles argentées cristaux Paris Nuit',
    price: 42.90,
    compareAtPrice: 49.90,
    color: 'Argenté',
    sizes: [],
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    categoryIndex: 3,
    collectionIndex: 3,
  },
  {
    name: 'Parure Élégance Dorée',
    description: 'Une parure complète comprenant un collier, une bague et des boucles d\'oreilles assortis en acier inoxydable doré. L\'ensemble parfait pour un look harmonieux et sophistiqué.',
    shortDescription: 'Parure complète dorée',
    price: 79.90,
    compareAtPrice: 99.90,
    color: 'Doré',
    sizes: [],
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    categoryIndex: 4,
    collectionIndex: 1,
  },
  {
    name: 'Parure Parisienne Argentée',
    description: 'Un ensemble coordonné de collier, bracelet et boucles d\'oreilles en acier inoxydable argenté. Une parure qui capture l\'élégance discrète et raffinée de Paris.',
    shortDescription: 'Parure complète argentée',
    price: 69.90,
    compareAtPrice: null,
    color: 'Argenté',
    sizes: [],
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: false,
    categoryIndex: 4,
    collectionIndex: 0,
  },
  {
    name: 'Piercing Étoile',
    description: 'Un piercing délicat en acier inoxydable doré en forme d\'étoile. Parfait pour ajouter une touche de scintillement subtil à votre oreille.',
    shortDescription: 'Piercing étoile doré',
    price: 19.90,
    compareAtPrice: null,
    color: 'Doré',
    sizes: [],
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    categoryIndex: 5,
    collectionIndex: 3,
  },
  {
    name: 'Piercing Cœur Paris',
    description: 'Un piercing romantique en acier inoxydable rose gold en forme de cœur. Un petit clin d\'œil à l\'amour qui flotte dans l\'air parisien.',
    shortDescription: 'Piercing cœur rose gold',
    price: 19.90,
    compareAtPrice: null,
    color: 'Rose Gold',
    sizes: [],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    categoryIndex: 5,
    collectionIndex: 0,
  },
  {
    name: 'Bague Rose Gold Lumière',
    description: 'Une bague délicate en acier inoxydable rose gold avec un fini brillant. Sa teinte rosée apporte une touche de douceur et de féminité à votre main.',
    shortDescription: 'Bague fine rose gold brillante',
    price: 22.90,
    compareAtPrice: null,
    color: 'Rose Gold',
    sizes: ['52', '54', '56', '58'],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    categoryIndex: 1,
    collectionIndex: 2,
  },
];

async function main() {
  console.log('Seeding database...');

  await prisma.contactMessage.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@elorparis.fr',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'Élor',
      role: 'ADMIN',
    },
  });
  console.log(`Admin created: ${admin.email}`);

  const userPassword = await bcrypt.hash('client123', 12);
  const client = await prisma.user.create({
    data: {
      email: 'client@example.com',
      password: userPassword,
      firstName: 'Marie',
      lastName: 'Dubois',
      role: 'CLIENT',
    },
  });
  console.log(`Client created: ${client.email}`);

  const createdCategories = [];
  for (const cat of categories) {
    const created = await prisma.category.create({
      data: {
        name: cat.name,
        slug: slugify(cat.name),
        description: cat.description,
        image: `https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400`,
      },
    });
    createdCategories.push(created);
  }
  console.log(`${createdCategories.length} categories created`);

  const createdCollections = [];
  for (const col of collections) {
    const created = await prisma.collection.create({
      data: {
        name: col.name,
        slug: slugify(col.name),
        description: col.description,
        image: `https://images.unsplash.com/photo-1515562141589-9f6b9dc5e7b0?w=600`,
        bannerImage: `https://images.unsplash.com/photo-1515562141589-9f6b9dc5e7b0?w=1200`,
      },
    });
    createdCollections.push(created);
  }
  console.log(`${createdCollections.length} collections created`);

  const productImages = [
    'https://images.unsplash.com/photo-1515562141589-9f6b9dc5e7b0?w=600',
    'https://images.unsplash.com/photo-1602751584558-8ba73aad10e4?w=600',
    'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600',
    'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600',
    'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600',
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600',
    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600',
    'https://images.unsplash.com/photo-1603975217914-6b8c9b6a3052?w=600',
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600',
  ];

  for (const product of products) {
    const images = [
      productImages[products.indexOf(product) % productImages.length],
      productImages[(products.indexOf(product) + 1) % productImages.length],
      productImages[(products.indexOf(product) + 2) % productImages.length],
    ];

    await prisma.product.create({
      data: {
        name: product.name,
        slug: slugify(product.name),
        description: product.description,
        shortDescription: product.shortDescription,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        images: serializeArray(images),
        material: 'Acier inoxydable',
        color: product.color,
        sizes: serializeArray(product.sizes),
        stock: Math.floor(Math.random() * 100) + 20,
        isFeatured: product.isFeatured,
        isBestSeller: product.isBestSeller,
        isNewArrival: product.isNewArrival,
        isActive: true,
        waterproof: true,
        hypoallergenic: true,
        categoryId: createdCategories[product.categoryIndex].id,
        collectionId: createdCollections[product.collectionIndex].id,
      },
    });
  }
  console.log(`${products.length} products created`);

  const reviewComments = [
    'Magnifique bijou, la qualité est exceptionnelle !',
    'Très élégant, je le porte tous les jours.',
    'Parfait pour offrir, ma femme a adoré.',
    'Rapport qualité-prix incroyable. Je recommande !',
    'Le design est superbe, exactement comme sur les photos.',
    'Livraison rapide et emballage soigné. Merci Élor !',
    'Je suis tombée amoureuse de ce collier. Il est magnifique.',
    'Conforme à mes attentes. Très belle finition.',
  ];

  const allProducts = await prisma.product.findMany();

  for (let i = 0; i < 8; i++) {
    await prisma.review.create({
      data: {
        userId: client.id,
        productId: allProducts[i].id,
        rating: Math.floor(Math.random() * 2) + 4,
        comment: reviewComments[i],
        isApproved: true,
      },
    });
  }
  console.log('8 reviews created');

  await prisma.newsletterSubscriber.create({
    data: { email: 'marie.dubois@example.com' },
  });
  console.log('Newsletter subscriber created');

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
