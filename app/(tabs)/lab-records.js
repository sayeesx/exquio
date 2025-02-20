import React, { useState, useEffect, useCallback, useMemo } from "react"
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Dimensions,
  Platform,
  FlatList,
  LayoutAnimation,
  Animated as RNAnimated,
  Share,
  ActivityIndicator,
  Alert,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import FontAwesome from "react-native-vector-icons/FontAwesome"
import moment from "moment"
import { UIManager } from "react-native"
import { handleScroll } from "../../components/CustomTabBar"
import Toast from 'react-native-toast-message'
import { LinearGradient } from 'expo-linear-gradient'
import { WebView } from 'react-native-webview';

const { width } = Dimensions.get("window")

const FILTER_TYPES = ["All", "Blood Test", "Radiology", "Others"]

const getGradientColors = (type) => {
  switch (type) {
    case "Blood Test":
      return ['#D32F2F', '#B71C1C']; // Darker red gradient
    case "Radiology":
      return ['#4568DC', '#B06AB3'];
    case "Others":
      return ['#38ef7d', '#11998e'];
    default:
      return ['#3B39E4', '#4568DC'];
  }
};

const getFilterAnimation = (type) => {
  switch (type) {
    case "Blood Test":
      return {
        scale: [1, 1.3, 1],
        rotate: ['0deg', '0deg', '-45deg', '45deg', '0deg'],
        duration: 600,
      };
    case "Radiology":
      return {
        scale: [1, 1.2],
        rotate: ['0deg', '360deg'],
        duration: 300,
      };
    case "Others":
      return {
        scale: [1, 0.8, 1.1, 1],
        rotate: ['0deg', '0deg', '0deg', '0deg'],
        duration: 400,
      };
    default:
      return {
        scale: [1, 1.1, 1],
        rotate: ['0deg', '180deg', '0deg'],
        duration: 500,
      };
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: 12, // Reduced from 20
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#212529',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#6C757D',
    letterSpacing: 0.2,
    textAlign: 'center',
    maxWidth: '80%',
  },
  alertOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  alertContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '80%',
    maxWidth: 320,
    padding: 20,
    alignItems: 'center',
  },
  alertIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 8,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 15,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  alertButton: {
    backgroundColor: '#3B39E4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 120,
  },
  alertButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  filterContainer: {
    marginTop: 8, // Reduced from 16
    marginBottom: 8,
    height: 44,
  },
  filterContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChip: {
    height: 36, // Slightly smaller
    paddingHorizontal: 16,
    borderRadius: 18,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  filterChipGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.9,
  },
  filterChipInactive: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  filterChipText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#495057",
  },
  activeFilterChipText: {
    color: "#fff",
    fontWeight: "700",
  },
  filterIcon: {
    marginRight: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  recordCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12, // Reduced padding
    marginBottom: 10,
    marginHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  recordContent: {
    flex: 1,
    zIndex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  locationText: {
    fontSize: 13,
    color: "#fff",
    opacity: 0.9,
    marginBottom: 8,
  },
  statusChip: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  recordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12, // Reduced margin
    marginTop: 0, // Remove the top margin
    marginLeft: 0, // Remove the left margin
  },
  recordInfo: {
    flex: 1,
  },
  recordActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,  // Reduced gap
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  recordType: {
    fontSize: 18, // Reduced font size
    fontWeight: "600",
    color: "#212529",
    marginBottom: 2,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recordDate: {
    fontSize: 14,
    color: "#6C757D",
  },
  daysAgo: {
    fontSize: 14,
    color: '#6C757D',
  },
  shareButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F8F7FF",
  },
  cardContent: {
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
    paddingTop: 12, // Reduced padding
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8, // Reduced margin
  },
  label: {
    fontSize: 14,
    color: "#6C757D",
  },
  value: {
    fontSize: 14,
    color: "#212529",
    fontWeight: "500",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  severityContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 13,
    fontWeight: "600",
  },
  viewButton: {
    overflow: 'hidden',
    borderRadius: 8,
    marginTop: 12, // Reduced margin
  },
  viewButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  viewButtonGradient: {
    paddingVertical: 10, // Smaller padding
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: "80%",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#212529",
  },
  closeButton: {
    padding: 8,
  },
  modalBody: {
    flex: 1,
  },
  modalDescription: {
    fontSize: 16,
    color: "#495057",
    marginBottom: 24,
    lineHeight: 24,
  },
  modalInfoSection: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  modalInfoTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 16,
  },
  modalInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  modalLabel: {
    fontSize: 15,
    color: "#6C757D",
  },
  modalValue: {
    fontSize: 15,
    color: "#212529",
    fontWeight: "500",
    flex: 1,
    marginLeft: 16,
    textAlign: 'right',
  },
  modalFooter: {
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
    paddingTop: 16,
  },
  modalButton: {
    overflow: 'hidden',
    borderRadius: 12,
  },
  modalButtonGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  listContent: {
    padding: 16,
  },
  downloadingContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  downloadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#3B39E4',
    fontWeight: '600',
  },
  reportViewer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  reportViewerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  downloadProgress: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  downloadProgressText: {
    marginTop: 20,
    fontSize: 16,
    color: '#3B39E4',
    fontWeight: '600',
  },
  downloadIcon: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0FF',
    borderRadius: 30,
    marginBottom: 10,
  },
  modalButtonProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  downloadingButton: {
    opacity: 0.8,
  },
  viewStatusContainer: {
    position: 'absolute',
    top: 5.5, // Changed from 8 to 0 to align with share button
    right: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6E6FF',
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  viewStatusText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 3,
  },
  severityChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-end',
  },
  severityText: {
    fontSize: 14,
    fontWeight: "600",
    color: '#fff',
  },
  filterIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
})

const labRecords = [
  {
    id: 1,
    title: "Complete Blood Count",
    date: "2025-02-05",
    doctor: "Dr. Sarah Johnson",
    lab: "Central Medical Lab",
    location: "New York Medical Center, 5th Avenue",
    status: "Completed",
    severity: "Normal",
    type: "Blood Test",
    description: "Routine blood test to check overall health status",
    viewed: false,
  },
  {
    id: 2,
    title: "Chest X-Ray",
    date: "2025-02-07",
    doctor: "Dr. Michael Chen",
    lab: "Advanced Imaging Center",
    location: "Memorial Hospital, West Wing",
    status: "Completed",
    severity: "Serious",
    type: "Radiology",
    description: "Chest examination for respiratory concerns",
    viewed: false,
  },
  {
    id: 3,
    title: "Brain MRI Scan",
    date: "2025-02-08",
    doctor: "Dr. Emily Brown",
    lab: "Neurological Institute",
    location: "City General Hospital, Block C",
    status: "Pending",
    severity: "Urgent",
    type: "Radiology",
    description: "Detailed brain scan for neurological assessment",
    viewed: false,
  },
  {
    id: 4,
    title: "Lipid Profile",
    date: "2025-02-06",
    doctor: "Dr. Robert Wilson",
    lab: "Cardiac Care Lab",
    location: "Heart Institute, South Block",
    status: "Completed",
    severity: "Attention",
    type: "Blood Test",
    description: "Cholesterol and triglycerides assessment",
    viewed: false,
  },
  {
    id: 5,
    title: "Thyroid Function Test",
    date: "2025-02-08",
    doctor: "Dr. Lisa Martinez",
    lab: "Endocrine Center",
    location: "Specialty Clinic, East Wing",
    status: "Processing",
    severity: "Normal",
    type: "Blood Test",
    description: "Comprehensive thyroid hormone analysis",
    viewed: false,
  },
  {
    id: 6,
    title: "Bone Density Scan",
    date: "2025-02-07",
    doctor: "Dr. Ruba Ali",
    lab: "Orthopedic Imaging",
    location: "Bone & Joint Center, 3rd Floor",
    status: "Completed",
    severity: "Attention",
    type: "Radiology",
    description: "Osteoporosis screening and bone health assessment",
    viewed: false,
  },
]

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

const getDaysAgo = (date) => {
  const days = moment().diff(moment(date), 'days');
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`; // Fixed template string syntax
};

const LabRecords = React.memo(
  function LabRecords() {
    const [selectedRecord, setSelectedRecord] = useState(null)
    const [modalVisible, setModalVisible] = useState(false)
    const [filterType, setFilterType] = useState("All")
    const [sortedRecords, setSortedRecords] = useState([])
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [showReportViewer, setShowReportViewer] = useState(false);
    const [reportUrl, setReportUrl] = useState(null);

    // Add this animated value state
    const [animatedFilters] = useState(() => 
      FILTER_TYPES.reduce((acc, type) => {
        acc[type] = {
          scale: new RNAnimated.Value(1),
          rotation: new RNAnimated.Value(0)
        };
        return acc;
      }, {})
    );

    // Add this animation function
    const animateFilter = useCallback((type) => {
      const animation = getFilterAnimation(type);
      
      // Reset values first
      animatedFilters[type].scale.setValue(1);
      animatedFilters[type].rotation.setValue(0);
    
      const scaleSequence = animation.scale.map((value) =>
        RNAnimated.spring(animatedFilters[type].scale, {
          toValue: value,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        })
      );
    
      const rotateSequence = animation.rotate.map((value, index) =>
        RNAnimated.timing(animatedFilters[type].rotation, {
          toValue: index,
          duration: animation.duration / animation.rotate.length,
          useNativeDriver: true,
        })
      );
    
      RNAnimated.parallel([
        RNAnimated.sequence(scaleSequence),
        RNAnimated.sequence(rotateSequence),
      ]).start();
    }, [animatedFilters]);

    useEffect(() => {
      const sorted = [...labRecords].sort((a, b) => moment(b.date).valueOf() - moment(a.date).valueOf())
      setSortedRecords(sorted)
    }, [])

    const filteredRecords = useMemo(() => {
      if (filterType === "All") return sortedRecords
      return sortedRecords.filter((record) => record.type === filterType)
    }, [filterType, sortedRecords])

    const handleFilterChange = useCallback(
      (newFilter) => {
        if (newFilter === filterType) return

        LayoutAnimation.configureNext({
          duration: 300,
          create: {
            type: LayoutAnimation.Types.easeInEaseOut,
            property: LayoutAnimation.Properties.opacity,
          },
          update: {
            type: LayoutAnimation.Types.easeInEaseOut,
          },
        });

        setFilterType(newFilter)
      },
      [filterType],
    )

    // Update the renderFilterChip function
    const renderFilterChip = useCallback(
      ({ item: type }) => {
        const isActive = filterType === type;
        const animation = getFilterAnimation(type);
        
        const animatedStyle = {
          transform: [
            { scale: animatedFilters[type].scale },
            {
              rotate: animatedFilters[type].rotation.interpolate({
                inputRange: Array.from({ length: animation.rotate.length }, (_, i) => i),
                outputRange: animation.rotate,
              })
            }
          ]
        };

        const getFilterIcon = (type) => {
          switch (type) {
            case "Blood Test":
              return "blood-bag";
            case "Radiology":
              return "radioactive";
            case "Others":
              return "file-document-multiple";
            default:
              return "format-list-bulleted";
          }
        };
        
        const getGradientColors = (type) => {
          switch (type) {
            case "Blood Test":
              return ['#D32F2F', '#B71C1C']; // Updated to match the darker red gradient
            case "Radiology":
              return ['#4568DC', '#B06AB3'];
            case "Others":
              return ['#38ef7d', '#11998e'];
            default:
              return ['#3B39E4', '#4568DC'];
          }
        };

        return (
          <TouchableOpacity
            style={[
              styles.filterChip,
              !isActive && styles.filterChipInactive
            ]}
            onPress={() => {
              handleFilterChange(type);
              if (!isActive) {
                animateFilter(type);
              }
            }}
            activeOpacity={0.8}
          >
            {isActive ? (
              <LinearGradient
                colors={getGradientColors(type)}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.filterChipGradient}
              />
            ) : null}
            <RNAnimated.View style={[styles.filterIconContainer, animatedStyle]}>
              <Icon 
                name={getFilterIcon(type)} 
                size={16} 
                color={isActive ? "#fff" : "#495057"} 
              />
            </RNAnimated.View>
            <Text style={[
              styles.filterChipText,
              isActive && styles.activeFilterChipText
            ]}>
              {type}
            </Text>
          </TouchableOpacity>
        );
      },
      [filterType, handleFilterChange, animatedFilters, animateFilter]
    );

    const getStatusColor = useCallback((status) => {
      switch (status.toLowerCase()) {
        case "completed":
          return "#4CAF50"
        case "processing":
          return "#2196F3"
        default:
          return "#FF9800"
      }
    }, [])

    const getSeverityColor = useCallback((severity) => {
      switch (severity.toLowerCase()) {
        case "serious":
          return "#FF4444"
        case "urgent":
          return "#FF9800"
        case "attention":
          return "#FFD600"
        default:
          return "#4CAF50"
      }
    }, [])

    const handleDownload = useCallback((record) => {
      setIsDownloading(true);
      setDownloadProgress(0);

      const interval = setInterval(() => {
        setDownloadProgress((prev) => {
          if (prev >= 1) {
            clearInterval(interval);
            setIsDownloading(false);
            setShowReportViewer(true);
            setReportUrl(`https://example.com/reports/${record.id}.pdf`); // Fixed template string
            return 1;
          }
          return prev + 0.1;
        });
      }, 200);

      Toast.show({
        type: 'success',
        text1: 'Download Started',
        text2: `${record.title} will be downloaded as PDF`, // Fixed template string
        position: 'bottom',
        visibilityTime: 2000,
      });
    }, []);

    const handleShare = async (record) => {
      try {
        const result = await Share.share({
          message: `Lab Report from ${record.lab}\nType: ${record.type}\nDate: ${record.date}\nDoctor: ${record.doctor}\n\nDescription: ${record.description}`, // Fixed template string
          title: `Lab Report - ${record.type}`, // Fixed template string
        });

        if (result.action === Share.sharedAction) {
          // Update the record as viewed after sharing
          const updatedRecords = sortedRecords.map((r) =>
            r.id === record.id ? { ...r, viewed: true } : r
          );
          setSortedRecords(updatedRecords);
        }
      } catch (error) {
        console.error(error);
      }
    };

    const renderItem = useCallback(
      ({ item: record }) => {
        return (
          <TouchableOpacity
            onPress={() => {
              setSelectedRecord(record)
              setModalVisible(true)
              const updatedRecords = sortedRecords.map((r) =>
                r.id === record.id ? { ...r, viewed: true } : r
              )
              setSortedRecords(updatedRecords)
            }}
            style={styles.recordCard}
            activeOpacity={0.7}
          >
            <View style={styles.recordHeader}>
              <View style={styles.recordInfo}>
                <Text style={styles.recordType} numberOfLines={1}>{record.title}</Text>
                <View style={styles.dateContainer}>
                  <Text style={styles.recordDate}>
                    {moment(record.date).format("MMM DD, YYYY")}
                  </Text>
                  <Text style={styles.daysAgo}>• {getDaysAgo(record.date)}</Text>
                </View>
              </View>
              
              <View style={styles.recordActions}>
                <View style={styles.viewStatusContainer}>
                  <Icon 
                    name={record.viewed ? "eye-check" : "eye-outline"} 
                    size={12} 
                    color={record.viewed ? "#28A745" : "#3B39E4"} 
                  />
                  <Text style={[
                    styles.viewStatusText,
                    { color: record.viewed ? "#28A745" : "#3B39E4" }
                  ]}>
                    {record.viewed ? "Viewed" : "New"}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.actionIcon}
                  onPress={() => handleShare(record)}
                >
                  <Icon name="share-variant" size={18} color="#6C757D" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.cardContent}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Lab</Text>
                <Text style={styles.value} numberOfLines={1}>{record.lab}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Status</Text>
                <View style={styles.statusContainer}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(record.status) }]} />
                  <Text style={[styles.statusText, { color: getStatusColor(record.status) }]}>{record.status}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )
      },
      [sortedRecords, handleShare],
    )

    const keyExtractor = useCallback((item) => item.id.toString(), [])

    const handleViewReport = useCallback((record, format) => {
      setIsDownloading(true);
      setDownloadProgress(0);

      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 1) {
            clearInterval(progressInterval);
            setIsDownloading(false);
            setShowReportViewer(true);
            setReportUrl(`https://example.com/reports/${record.id}`); // Fixed template string
            return 0;
          }
          return prev + 0.1;
        });
      }, 200);
    }, []);

    const renderReportViewer = () => (
      <Modal
        animationType="slide"
        visible={showReportViewer}
        onRequestClose={() => setShowReportViewer(false)}
      >
        <SafeAreaView style={styles.reportViewer}>
          <View style={styles.reportViewerHeader}>
            <Text style={styles.modalTitle}>Report Viewer</Text>
            <TouchableOpacity onPress={() => setShowReportViewer(false)}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <WebView
            source={{ uri: reportUrl }}
            style={{ flex: 1 }}
          />
        </SafeAreaView>
      </Modal>
    );

    const handleDownloadReport = useCallback((record) => {
      setIsDownloading(true);
      setDownloadProgress(0);

      const interval = setInterval(() => {
        setDownloadProgress((prev) => {
          const nextProgress = prev + 0.1;
          if (nextProgress >= 0.99) { // Change to 0.99 to ensure we don't exceed 100%
            clearInterval(interval);
            setIsDownloading(false);
            setShowReportViewer(true);
            setReportUrl(`https://example.com/reports/${record.id}.pdf`); // Fixed template string
            return 1;
          }
          return nextProgress;
        });
      }, 200);
    }, []);

    const renderModalFooter = () => (
      <View style={styles.modalFooter}>
        <TouchableOpacity
          style={[
            styles.modalButton,
            isDownloading && styles.downloadingButton
          ]}
          onPress={() => !isDownloading && handleDownloadReport(selectedRecord)}
          disabled={isDownloading}
        >
          <LinearGradient
            colors={getGradientColors(selectedRecord?.type)}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalButtonGradient}
          >
            {isDownloading && (
              <View 
                style={[
                  styles.modalButtonProgress, 
                  { width: `${Math.min(downloadProgress * 100, 100)}%` }
                ]} 
              />
            )}
            <Icon 
              name={isDownloading ? "progress-download" : "download"} 
              size={20} 
              color="#fff" 
            />
            <Text style={styles.modalButtonText}>
              {isDownloading 
                ? `Downloading... ${Math.min(Math.round(downloadProgress * 100), 100)}%`
                : "Download Report"
              }
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Lab Records</Text>
            <Text style={styles.headerSubtitle}>
              Your medical test results in one place
            </Text>
          </View>
          <FlatList
            horizontal
            data={FILTER_TYPES}
            renderItem={renderFilterChip}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
            contentContainerStyle={styles.filterContent}
            decelerationRate="fast"
            snapToAlignment="center"
            bounces={false}
          />
        </View>

        <View style={{ flex: 1 }}>
          <RNAnimated.FlatList
            data={filteredRecords}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={[
              styles.listContent,
              { paddingHorizontal: 0, paddingTop: 8 }
            ]}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={5}
          />
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {selectedRecord && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{selectedRecord.title}</Text>
                    <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                      <Icon name="close" size={24} color="#000" />
                    </TouchableOpacity>
                  </View>
                  <ScrollView style={styles.modalBody}>
                    <Text style={styles.modalDescription}>{selectedRecord.description}</Text>
                    <View style={styles.modalInfoSection}>
                      <Text style={styles.modalInfoTitle}>Report Details</Text>
                      <View style={styles.modalInfoRow}>
                        <Text style={styles.modalLabel}>Date</Text>
                        <Text style={styles.modalValue}>
                          {moment(selectedRecord.date).format("MMMM DD, YYYY")}
                        </Text>
                      </View>
                      <View style={styles.modalInfoRow}>
                        <Text style={styles.modalLabel}>Doctor</Text>
                        <Text style={styles.modalValue}>{selectedRecord.doctor}</Text>
                      </View>
                      <View style={styles.modalInfoRow}>
                        <Text style={styles.modalLabel}>Lab</Text>
                        <Text style={styles.modalValue}>{selectedRecord.lab}</Text>
                      </View>
                      <View style={styles.modalInfoRow}>
                        <Text style={styles.modalLabel}>Location</Text>
                        <Text style={styles.modalValue}>{selectedRecord.location}</Text>
                      </View>
                      <View style={styles.modalInfoRow}>
                        <Text style={styles.modalLabel}>Severity</Text>
                        <View style={[
                          styles.severityChip,
                          { backgroundColor: getSeverityColor(selectedRecord.severity) }
                        ]}>
                          <Text style={styles.severityText}>
                            {selectedRecord.severity}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </ScrollView>
                  {renderModalFooter()}
                </>
              )}
            </View>
          </View>
        </Modal>
        
        {renderReportViewer()}
      </SafeAreaView>
    )
  },
  (prevProps, nextProps) => {
    return true
  },
)

export default LabRecords