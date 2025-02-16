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
  Animated,
  Share,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import FontAwesome from "react-native-vector-icons/FontAwesome"
import moment from "moment"
import { UIManager } from "react-native"
import { handleScroll } from "../../components/CustomTabBar"
import Toast from 'react-native-toast-message'

const { width } = Dimensions.get("window")

const FILTER_TYPES = ["All", "Blood Test", "Radiology", "Others"]
const REPORT_FORMATS = ["PDF", "Image"]

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#212529",
    letterSpacing: -0.5,
  },
  aiButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0FF",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#6C63FF",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  filterContainer: {
    flexDirection: "row",
    marginTop: 4,
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  filterContent: {
    paddingRight: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F8F9FA",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  activeFilterChip: {
    backgroundColor: "#3B39E4",
    borderColor: "#3B39E4",
  },
  filterChipText: {
    color: "#495057",
    fontSize: 14,
    fontWeight: "500",
  },
  activeFilterChipText: {
    color: "#fff",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  recordCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  recordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  recordInfo: {
    flex: 1,
  },
  recordActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  recordType: {
    fontSize: 20,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 4,
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
    paddingTop: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
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
    backgroundColor: "#3B39E4",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  viewButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
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
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 15,
    color: "#6C757D",
  },
  modalValue: {
    fontSize: 15,
    color: "#212529",
    fontWeight: "500",
  },
  modalFooter: {
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
    paddingTop: 16,
  },
  modalButton: {
    backgroundColor: "#3B39E4",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  formatModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formatModalContent: {
    backgroundColor: '#FFFFFF',
    width: '80%',
    padding: 0,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  formatModalHeader: {
    padding: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    alignItems: 'center',
  },
  formatModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
    textAlign: 'center',
  },
  formatModalSubtitle: {
    fontSize: 13,
    color: '#6C757D',
    marginTop: 2,
    textAlign: 'center',
  },
  formatOptionsContainer: {
    padding: 12,
  },
  formatOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  formatOptionSelected: {
    backgroundColor: '#3B39E410',
    borderColor: '#3B39E4',
  },
  formatIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  formatTextContainer: {
    flex: 1,
  },
  formatOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
  },
  formatOptionDescription: {
    fontSize: 13,
    color: '#6C757D',
  },
  formatOptionTextSelected: {
    color: '#3B39E4',
  },
  formatModalFooter: {
    padding: 12,
    paddingTop: 0,
  },
  downloadButton: {
    backgroundColor: '#3B39E4',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 4,
  },
  downloadButtonDisabled: {
    opacity: 0.5,
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  formatModalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  formatModalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  formatModalButtonCancel: {
    backgroundColor: '#F8F9FA',
  },
  formatModalButtonConfirm: {
    backgroundColor: '#3B39E4',
  },
  formatModalButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  formatModalButtonTextCancel: {
    color: '#6C757D',
  },
  formatModalButtonTextConfirm: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
  },
  aiModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiModalContent: {
    backgroundColor: '#FFFFFF',
    width: '85%',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#3B39E4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  aiModalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 57, 228, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  aiModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3B39E4',
    marginBottom: 12,
    textAlign: 'center',
  },
  aiModalMessage: {
    fontSize: 16,
    color: '#495057',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  aiModalButton: {
    backgroundColor: '#3B39E4',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
  },
  aiModalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
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
    doctor: "Dr. James Park",
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
  return `${days} days ago`;
};

const LabRecords = React.memo(
  function LabRecords() {
    const [selectedRecord, setSelectedRecord] = useState(null)
    const [modalVisible, setModalVisible] = useState(false)
    const [filterType, setFilterType] = useState("All")
    const [sortedRecords, setSortedRecords] = useState([])
    const [showAIModal, setShowAIModal] = useState(false)
    const [showFormatModal, setShowFormatModal] = useState(false)
    const [selectedFormat, setSelectedFormat] = useState(null)

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

        // Use LayoutAnimation for smoother transitions
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)

        setFilterType(newFilter)
      },
      [filterType],
    )

    const renderFilterChip = useCallback(
      ({ item: type }) => {
        const isActive = filterType === type
        return (
          <TouchableOpacity
            style={[styles.filterChip, isActive && styles.activeFilterChip]}
            onPress={() => handleFilterChange(type)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterChipText, isActive && styles.activeFilterChipText]}>{type}</Text>
          </TouchableOpacity>
        )
      },
      [filterType, handleFilterChange],
    )

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

    const handleDownload = useCallback((record, format) => {
      // Here you would implement the actual download logic based on the selected format
      Toast.show({
        type: 'success',
        text1: 'Download Started',
        text2: `${record.title} will be downloaded as ${format}`,
        position: 'bottom',
        visibilityTime: 2000,
      });
      // Reset format selection
      setSelectedFormat(null);
    }, []);

    const handleFormatSelect = useCallback((format) => {
      setSelectedFormat(format);
    }, []);

    const handleDownloadConfirm = useCallback(() => {
      if (selectedRecord && selectedFormat) {
        // Close format modal first
        setShowFormatModal(false);
        
        // Show toast message after a small delay
        setTimeout(() => {
          Toast.show({
            type: 'success',
            position: 'bottom',
            text1: '📥 Download Started',
            text2: `${selectedRecord.title} - ${selectedFormat} format`,
            visibilityTime: 2500,
            autoHide: true,
            bottomOffset: 60,
            onShow: () => {
              // Add any additional download logic here
              console.log('Download started:', selectedRecord.title, selectedFormat);
            }
          });
        }, 300);

        // Reset format selection
        setSelectedFormat(null);
      }
    }, [selectedRecord, selectedFormat]);

    const handleShare = async (record) => {
      try {
        const result = await Share.share({
          message: `Lab Report from ${record.lab}\nType: ${record.type}\nDate: ${record.date}\nDoctor: ${record.doctor}\n\nDescription: ${record.description}`,
          title: `Lab Report - ${record.type}`,
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
              // Mark as viewed when opened
              const updatedRecords = sortedRecords.map((r) =>
                r.id === record.id ? { ...r, viewed: true } : r
              )
              setSortedRecords(updatedRecords)
            }}
            style={styles.recordCard}
          >
            <View style={styles.recordHeader}>
              <View style={styles.recordInfo}>
                <Text style={styles.recordType}>{record.title}</Text>
                <View style={styles.dateContainer}>
                  <Text style={styles.recordDate}>
                    {moment(record.date).format("MMM DD, YYYY")}
                  </Text>
                  <Text style={styles.daysAgo}>• {getDaysAgo(record.date)}</Text>
                </View>
              </View>
              <View style={styles.recordActions}>
                <TouchableOpacity
                  onPress={() => handleShare(record)}
                  style={styles.shareButton}
                >
                  <Icon name="share-variant" size={24} color="#3B39E4" />
                </TouchableOpacity>
                {record.viewed ? (
                  <Icon name="eye-check" size={24} color="#28A745" />
                ) : (
                  <Icon name="eye-outline" size={24} color="#FF4444" />
                )}
              </View>
            </View>

            <View style={styles.cardContent}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Doctor</Text>
                <Text style={styles.value}>{record.doctor}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Lab</Text>
                <Text style={styles.value}>{record.lab}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Location</Text>
                <Text style={styles.value}>{record.location}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Status</Text>
                <View style={styles.statusContainer}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(record.status) }]} />
                  <Text style={[styles.statusText, { color: getStatusColor(record.status) }]}>{record.status}</Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Severity</Text>
                <View
                  style={[
                    styles.severityContainer,
                    { backgroundColor: `${getSeverityColor(record.severity)}20` },
                  ]}
                >
                  <Text style={[styles.severityText, { color: getSeverityColor(record.severity) }]}>
                    {record.severity}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => {
                setSelectedRecord(record)
                setModalVisible(true)
                // Mark as viewed when opened
                const updatedRecords = sortedRecords.map((r) =>
                  r.id === record.id ? { ...r, viewed: true } : r
                )
                setSortedRecords(updatedRecords)
              }}
            >
              <Text style={styles.viewButtonText}>View Details</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )
      },
      [sortedRecords],
    )

    const keyExtractor = useCallback((item) => item.id.toString(), [])

    const handleAIButtonPress = () => {
      setShowAIModal(true);
    };

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Lab Records</Text>
            <TouchableOpacity 
              style={styles.aiButton} 
              activeOpacity={0.8}
              onPress={handleAIButtonPress}
            >
              <Icon name="robot" size={24} color="#3B39E4" />
            </TouchableOpacity>
          </View>

          <FlatList
            horizontal
            data={FILTER_TYPES}
            renderItem={renderFilterChip}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
            contentContainerStyle={styles.filterContent}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Animated.FlatList
            data={filteredRecords}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContent}
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
                        <Text style={styles.modalValue}>{moment(selectedRecord.date).format("MMMM DD, YYYY")}</Text>
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
                    </View>
                  </ScrollView>
                  <View style={styles.modalFooter}>
                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={() => setShowFormatModal(true)}
                    >
                      <Icon name="download" size={20} color="#fff" />
                      <Text style={styles.modalButtonText}>Download Report</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
        {/* AI Coming Soon Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showAIModal}
          onRequestClose={() => setShowAIModal(false)}
        >
          <View style={styles.aiModalOverlay}>
            <View style={styles.aiModalContent}>
              <View style={styles.aiModalIconContainer}>
                <Icon name="robot" size={40} color="#3B39E4" />
              </View>
              <Text style={styles.aiModalTitle}>AI Assistant Coming Soon!</Text>
              <Text style={styles.aiModalMessage}>
                We're working on something exciting! Our AI assistant is being developed to make your healthcare experience even better.
              </Text>
              <TouchableOpacity
                style={styles.aiModalButton}
                onPress={() => setShowAIModal(false)}
              >
                <Text style={styles.aiModalButtonText}>Got it!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {/* Format Selection Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showFormatModal}
          onRequestClose={() => {
            setShowFormatModal(false);
            setSelectedFormat(null);
          }}
        >
          <View style={styles.formatModalOverlay}>
            <View style={styles.formatModalContent}>
              <View style={styles.formatModalHeader}>
                <Text style={styles.formatModalTitle}>Download Report</Text>
                <Text style={styles.formatModalSubtitle}>Choose your preferred format</Text>
              </View>
              
              <View style={styles.formatOptionsContainer}>
                {REPORT_FORMATS.map((format) => {
                  const isPDF = format.toLowerCase() === 'pdf';
                  return (
                    <TouchableOpacity
                      key={format}
                      style={[
                        styles.formatOption,
                        selectedFormat === format && styles.formatOptionSelected,
                      ]}
                      onPress={() => handleFormatSelect(format)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.formatIconContainer}>
                        <Icon
                          name={isPDF ? 'file-pdf-box' : 'image'}
                          size={24}
                          color={selectedFormat === format ? '#3B39E4' : '#6C757D'}
                        />
                      </View>
                      <View style={styles.formatTextContainer}>
                        <Text
                          style={[
                            styles.formatOptionText,
                            selectedFormat === format && styles.formatOptionTextSelected,
                          ]}
                        >
                          {format}
                        </Text>
                        <Text style={styles.formatOptionDescription}>
                          {isPDF 
                            ? 'Best for printing and sharing'
                            : 'Perfect for quick viewing'}
                        </Text>
                      </View>
                      {selectedFormat === format && (
                        <Icon
                          name="check-circle"
                          size={20}
                          color="#3B39E4"
                          style={{ marginLeft: 6 }}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.formatModalFooter}>
                <TouchableOpacity
                  style={[
                    styles.downloadButton,
                    !selectedFormat && styles.downloadButtonDisabled,
                  ]}
                  onPress={() => {
                    if (selectedFormat) {
                      handleDownloadConfirm();
                      // Add haptic feedback if available
                      if (Platform.OS === 'ios') {
                        // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      }
                    }
                  }}
                  disabled={!selectedFormat}
                  activeOpacity={0.7}
                >
                  <Icon name="download" size={20} color="#FFFFFF" />
                  <Text style={styles.downloadButtonText}>
                    {selectedFormat ? `Download as ${selectedFormat}` : 'Select a format'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    )
  },
  (prevProps, nextProps) => {
    return true
  },
)

export default LabRecords
