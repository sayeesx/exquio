import { supabase } from './supabase';

const initialHospitals = [
  {
    name: "ASTER MIMS HOSPITAL",
    location: "Kottakkal Main Road",
    image_url: 'https://www.asterhospitals.in/sites/default/files/styles/optimize_images/public/2021-01/hospital-image_1.png.webp?itok=7qR8Hcp7',
    logo_url: "aster.png",
    type: "multi",
    emergency_contact: "0483-2809640",
    email: "info@astermims.com",
    rating: 4.5  // Ensure all ratings are numbers
  },
  {
    name: "ALMAS HOSPITAL",
    location: "Near Bus Stand",
    image_url: "almas.png",
    logo_url: "almas.png",
    type: "multi",
    email: "info@almashospital.com"
  },
  {
    name: "HMS HOSPITAL",
    location: "MG Road",
    image_url: "https://lh3.googleusercontent.com/p/AF1QipOyRNyXCNKsv7oGheU53iKTxotmy2NHf5rT4IRi=s680-w680-h510",
    logo_url: "hms.png",
    type: "multi",
    email: "info@hmshospital.com"
  },
  {
    name: "ARYA VAIDYA SALA",
    location: "Kottakkal, Near Temple",
    image_url: "https://www.aryavaidyasala.com/images/avs_main.jpg",
    logo_url: "avs.png",
    type: "ayurveda",
    description: "Premier Ayurvedic healthcare institution since 1902",
    emergency_contact: "0483-2742216",
    email: "mail@aryavaidyasala.com",
    rating: 4.8
  },
  {
    name: "KIMS AL SHIFA",
    location: "Perinthalmanna",
    image_url: "https://www.kimshealth.org/wp-content/uploads/2022/02/KIMS-ALSHIFA.jpg",
    logo_url: "kims.png",
    type: "multi",
    emergency_contact: "04933-298300",
    email: "info@kimsalshifa.com",
    rating: 4.7
  }
];

export const kottakkalHospitals = [
  {
    id: 'kot001',
    name: 'Arya Vaidya Sala',
    location: 'Kottakkal, Malappuram',
    type: 'ayurveda',
    image: 'https://i.ibb.co/K9yyQXp/arya-vaidya-sala.jpg',
    logo: require('../assets/hospital-logos/avs.png'),
    description: 'Premier Ayurvedic healthcare institution since 1902',
    rating: 4.8
  },
  {
    id: 'kot002',
    name: 'KIMS Al Shifa',
    location: 'Perinthalmanna, Malappuram',
    type: 'multi',
    image: 'https://i.ibb.co/SXL1Sw4/kims-alshifa.jpg',
    logo: require('../assets/hospital-logos/kims.png'),
    description: 'Modern multispecialty hospital near Kottakkal',
    rating: 4.6
  },
  {
    id: 'kot003',
    name: 'Moulana Hospital',
    location: 'Perinthalmanna, Malappuram',
    type: 'multi',
    image: 'https://i.ibb.co/h2ZNCJW/moulana.jpg',
    logo: require('../assets/hospital-logos/moulana.png'),
    description: 'Advanced healthcare facility serving since 1984',
    rating: 4.5
  }
];

export const seedHospitalData = async () => {
  try {
    // First check if data already exists
    const { data: existingHospitals } = await supabase
      .from('hospitals')
      .select('id')
      .limit(1);

    if (existingHospitals?.length > 0) {
      console.log('Data already seeded');
      return;
    }

    // Insert initial data
    const { data, error } = await supabase
      .from('hospitals')
      .insert(initialHospitals)
      .select();

    if (error) throw error;
    
    console.log('Successfully seeded hospital data:', data);
    return data;
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
};
