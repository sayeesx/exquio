export const specialties = [
  {
    id: "cardiology",
    name: "Cardiology",
    doctorsAvailable: 12,
    icon: "heart-pulse"
  },
  {
    id: "neurology",
    name: "Neurology",
    doctorsAvailable: 8,
    icon: "brain"
  },
  {
    id: "orthopedics",
    name: "Orthopedics",
    doctorsAvailable: 15,
    icon: "bone"
  },
  {
    id: "pediatrics",
    name: "Pediatrics",
    doctorsAvailable: 10,
    icon: "baby-face-outline"
  },
  {
    id: "dermatology",
    name: "Dermatology",
    doctorsAvailable: 7,
    icon: "skin"
  },
  {
    id: "ophthalmology",
    name: "Ophthalmology",
    doctorsAvailable: 6,
    icon: "eye"
  },
  {
    id: "dentistry",
    name: "Dentistry",
    doctorsAvailable: 9,
    icon: "tooth"
  },
  {
    id: "psychiatry",
    name: "Psychiatry",
    doctorsAvailable: 5,
    icon: "brain"
  }
];

export const popularDoctors = [
  {
    id: "1",
    name: "Dr. Tahsin Neduvanchery",
    specialty: "Cardiology",
    specialtyIcon: "heart-pulse",
    experience: 5,
    fieldOfStudy: "MBBS, MD, DM, MRCP, FRCP, FACC",
    image: require("../../assets/doctors/tahsin.png"),
  },
  {
    id: "2",
    name: "Dr. Faizal M Iqbal",
    specialty: " Orthopaedic Surgeon",
    specialtyIcon: "bone",
    experience: 8,
    fieldOfStudy: "MBBS, MS, FRIEBERG",
    image: require("../../assets/doctors/faizal.png"),
  },
  {
    id: "3",
    name: "Dr. Chandrasekhar J",
    specialty: "Neurology",
    specialtyIcon: "brain",
    experience: 6,
    fieldOfStudy: "MBBS, DCH",
    image: require("../../assets/doctors/chandru.png"),
  },
];

export const hospitalLogos = {
  "Chinasski": require("../../assets/hospital-logos/aster.png"),
  "Boardroom": require("../../assets/hospital-logos/almas.png"),
  "Conference": require("../../assets/hospital-logos/hms.png"),
};

export const hospitals = [
  {
    id: "1",
    name: "Aster Mims",
    location: "NH65 Kottakkal Changuvetty ",
    image_path: "mims.webp",
    logo_path: "asterog.png",
    timing: "9:00 AM - 9:00 PM",
    activeDoctors: 12,
    color: "#4DABF7",
  },
  {
    id: "2",
    name: "Almas Hospital",
    location: "Changuvetty Street, Kottakkal",
    image_path: "almas.png",
    logo_path: "almasog.png",
    timing: "24/7",
    activeDoctors: 15,
    color: "#FF6B6B",
  },
  {
    id: "3",
    name: "HMS Hospital",
    location: "NH 65 Kottakkal Palathara",
    image_path: "hmshospital.png",
    logo_path: "hmsog.png",
    timing: "8:00 AM - 10:00 PM",
    activeDoctors: 8,
    color: "#69DB7C",
  },
];