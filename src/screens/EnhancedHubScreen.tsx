import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
} from 'react-native';
import {
  BusinessNewsService,
  NewsArticle,
} from '../services/businessNewsService';
import {
  CampusLifeFeaturesEngine,
  CanteenRushStatus,
  FacultyOfficeHourSlot,
  SyllabusVelocity,
  LibraryBook,
  CANTEEN_LOCATIONS,
  CanteenId,
  XeroxRushStatus,
  DEFAULT_XEROX_RATES,
} from '../services/campusLifeFeaturesEngine';

export interface EnhancedHubScreenProps {
  studentRollNo: string;
  studentName: string;
  onRefresh?: () => void;
  isEnhancedSuit?: boolean;
}

type HubSection = 'NEWS' | 'CANTEEN_XEROX' | 'FACULTY' | 'SYLLABUS' | 'LIBRARY';

export const EnhancedHubScreen: React.FC<EnhancedHubScreenProps> = ({
  studentRollNo,
  studentName,
  isEnhancedSuit = true,
}) => {
  const [activeSection, setActiveSection] = useState<HubSection>('NEWS');

  // Sub-tab for Canteen vs Xerox
  const [canteenSubTab, setCanteenSubTab] = useState<'CANTEEN' | 'XEROX'>('CANTEEN');
  const [selectedCanteenId, setSelectedCanteenId] = useState<CanteenId>('MAIN');

  // Live state
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsLastUpdated, setNewsLastUpdated] = useState<string>(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
  const [newsCountdownSeconds, setNewsCountdownSeconds] = useState<number>(
    BusinessNewsService.getRefreshIntervalSeconds()
  );
  const [isRefreshingNews, setIsRefreshingNews] = useState<boolean>(false);

  const [canteenStatus, setCanteenStatus] = useState<CanteenRushStatus | null>(null);
  const [xeroxStatus, setXeroxStatus] = useState<XeroxRushStatus | null>(null);
  const [facultySlots, setFacultySlots] = useState<FacultyOfficeHourSlot[]>([]);
  const [syllabusList, setSyllabusList] = useState<SyllabusVelocity[]>([]);
  const [libraryBooks, setLibraryBooks] = useState<LibraryBook[]>([]);

  // Xerox Calculator State
  const [xeroxPages, setXeroxPages] = useState<string>('10');
  const [xeroxCopies, setXeroxCopies] = useState<string>('1');
  const [isColor, setIsColor] = useState<boolean>(false);
  const [isDoubleSided, setIsDoubleSided] = useState<boolean>(false);
  const [bindingType, setBindingType] = useState<'NONE' | 'SPIRAL' | 'FOLDER'>('NONE');
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  // Status message / booking confirmation
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, [selectedCanteenId]);

  // 15-Minute News Auto-Refresh ticker & countdown
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = BusinessNewsService.getSecondsUntilNextRefresh();
      setNewsCountdownSeconds(remaining);
      if (remaining <= 0) {
        handleRefreshNews(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRefreshNews = (manual: boolean = false) => {
    setIsRefreshingNews(true);
    const updated = BusinessNewsService.getLatestHeadlines(true);
    setNews(updated);
    setNewsLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setNewsCountdownSeconds(BusinessNewsService.getRefreshIntervalSeconds());
    if (manual) {
      setActionNotice('Live Business News Feed refreshed successfully.');
      setTimeout(() => setActionNotice(null), 3000);
    }
    setTimeout(() => setIsRefreshingNews(false), 350);
  };

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const loadAllData = async () => {
    setNews(BusinessNewsService.getLatestHeadlines());
    setCanteenStatus(CampusLifeFeaturesEngine.getCanteenRushStatus(selectedCanteenId));
    setXeroxStatus(CampusLifeFeaturesEngine.getXeroxRushStatus());
    setFacultySlots(CampusLifeFeaturesEngine.getFacultyOfficeSlots());
    setSyllabusList(CampusLifeFeaturesEngine.getSyllabusVelocitySummary());
    const books = await CampusLifeFeaturesEngine.getBorrowedLibraryBooks();
    setLibraryBooks(books);
  };

  const handleBookSlot = (slot: FacultyOfficeHourSlot) => {
    const notice = `Consultation booked with ${slot.facultyName} on ${slot.day} (${slot.timing}) at ${slot.cabin}.`;
    setActionNotice(notice);
    setFacultySlots((prev) =>
      prev.map((s) => (s.id === slot.id ? { ...s, isAvailable: false } : s))
    );
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleRenewBook = async (bookId: string) => {
    const res = await CampusLifeFeaturesEngine.renewBook(bookId);
    if (res.success) {
      setActionNotice(`Book renewed successfully! New due date: ${res.newDueDate}`);
      const books = await CampusLifeFeaturesEngine.getBorrowedLibraryBooks();
      setLibraryBooks(books);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  // Xerox Cost calculation
  const parsedPages = parseInt(xeroxPages, 10) || 1;
  const parsedCopies = parseInt(xeroxCopies, 10) || 1;
  const calculatedTotal = CampusLifeFeaturesEngine.calculatePrintCost(
    parsedPages,
    parsedCopies,
    isColor,
    isDoubleSided,
    bindingType
  );

  const handleSendToWhatsApp = () => {
    const msg = encodeURIComponent(
      `[PSGIM Print Request]\nStudent: ${studentName || 'Student'} (${studentRollNo || 'MBA'})\nPages: ${parsedPages}\nCopies: ${parsedCopies}\nPrint Type: ${isColor ? 'Color' : isDoubleSided ? 'B&W Double Sided' : 'B&W Single Sided'}\nBinding: ${bindingType}\nTotal Amount: Rs. ${calculatedTotal}\nAttached document below:`
    );
    // Standard campus shop WhatsApp placeholder (or user-provided contact)
    const url = `https://wa.me/?text=${msg}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Notice', 'Unable to open WhatsApp automatically. Pre-formatted details ready.');
    });
  };

  const selectedCanteen = CANTEEN_LOCATIONS[selectedCanteenId];

  return (
    <View style={styles.container}>
      {/* Top Section Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.headerTitle}>ENHANCED SUIT HUB</Text>
          <Text style={styles.headerSubtitle}>
            Autonomous Campus Intelligence & Student Amenities
          </Text>
        </View>
        <View style={styles.badgeLive}>
          <Text style={styles.badgeLiveText}>ONLINE</Text>
        </View>
      </View>

      {/* Action Notification Banner */}
      {actionNotice && (
        <View style={styles.noticeBanner}>
          <Text style={styles.noticeText}>{actionNotice}</Text>
        </View>
      )}

      {/* Section Filter Pills */}
      <View style={styles.navBarWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.navBarContent}
        >
          <TouchableOpacity
            style={[styles.navPill, activeSection === 'NEWS' && styles.navPillActive]}
            onPress={() => setActiveSection('NEWS')}
          >
            <Text style={[styles.navPillText, activeSection === 'NEWS' && styles.navPillTextActive]}>
              Live News Feed
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navPill, activeSection === 'CANTEEN_XEROX' && styles.navPillActive]}
            onPress={() => setActiveSection('CANTEEN_XEROX')}
          >
            <Text style={[styles.navPillText, activeSection === 'CANTEEN_XEROX' && styles.navPillTextActive]}>
              Canteen & Xerox Radar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navPill, activeSection === 'FACULTY' && styles.navPillActive]}
            onPress={() => setActiveSection('FACULTY')}
          >
            <Text style={[styles.navPillText, activeSection === 'FACULTY' && styles.navPillTextActive]}>
              Faculty Office Booking
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navPill, activeSection === 'SYLLABUS' && styles.navPillActive]}
            onPress={() => setActiveSection('SYLLABUS')}
          >
            <Text style={[styles.navPillText, activeSection === 'SYLLABUS' && styles.navPillTextActive]}>
              Syllabus Velocity
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navPill, activeSection === 'LIBRARY' && styles.navPillActive]}
            onPress={() => setActiveSection('LIBRARY')}
          >
            <Text style={[styles.navPillText, activeSection === 'LIBRARY' && styles.navPillTextActive]}>
              Library Shield
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollInner}>
        {/* ============================================================ */}
        {/* 1. LIVE BUSINESS NEWS FEED */}
        {/* ============================================================ */}
        {activeSection === 'NEWS' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Curated Business Press</Text>
              <Text style={styles.sectionCaption}>
                Executive headlines from The Hindu, BusinessLine & Business Standard with actionable MBA takeaways.
              </Text>

              {/* 15-Minute Live Auto-Sync Status Bar */}
              <View style={styles.newsSyncBar}>
                <View style={styles.newsSyncInfo}>
                  <View style={styles.syncPulseDot} />
                  <Text style={styles.newsSyncText}>
                    AUTO-REFRESH: 15 MIN  |  Last: {newsLastUpdated}  |  Next: {formatCountdown(newsCountdownSeconds)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.newsRefreshBtn, isRefreshingNews && styles.newsRefreshBtnActive]}
                  onPress={() => handleRefreshNews(true)}
                  disabled={isRefreshingNews}
                >
                  <Text style={styles.newsRefreshBtnText}>
                    {isRefreshingNews ? 'SYNCING...' : 'REFRESH NOW'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {news.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.newsSource}>{item.source.toUpperCase()}</Text>
                  <Text style={styles.newsDate}>{item.publishedDate}</Text>
                </View>
                <Text style={styles.newsTitle}>{item.title}</Text>
                <Text style={styles.newsSummary}>{item.summary}</Text>

                <View style={styles.takeawayBox}>
                  <Text style={styles.takeawayLabel}>MBA Takeaway:</Text>
                  <Text style={styles.takeawayText}>{item.mbaTakeaway}</Text>
                </View>

                {item.articleUrl ? (
                  <TouchableOpacity
                    style={styles.newsReadMoreBtn}
                    onPress={() => Linking.openURL(item.articleUrl)}
                  >
                    <Text style={styles.newsReadMoreText}>Read Full Source Article</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ))}
          </View>
        )}

        {/* ============================================================ */}
        {/* 2. CANTEEN & XEROX RADAR */}
        {/* ============================================================ */}
        {activeSection === 'CANTEEN_XEROX' && (
          <View>
            {/* Sub-selector: Canteen vs Xerox */}
            <View style={styles.subTabRow}>
              <TouchableOpacity
                style={[styles.subTabBtn, canteenSubTab === 'CANTEEN' && styles.subTabBtnActive]}
                onPress={() => setCanteenSubTab('CANTEEN')}
              >
                <Text style={[styles.subTabBtnText, canteenSubTab === 'CANTEEN' && styles.subTabBtnTextActive]}>
                  Canteen Radar (3 Spots)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.subTabBtn, canteenSubTab === 'XEROX' && styles.subTabBtnActive]}
                onPress={() => setCanteenSubTab('XEROX')}
              >
                <Text style={[styles.subTabBtnText, canteenSubTab === 'XEROX' && styles.subTabBtnTextActive]}>
                  Xerox Print & Pay Hub
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sub-view A: CANTEEN RADAR */}
            {canteenSubTab === 'CANTEEN' && (
              <View>
                {/* 3 Canteen Selection Chips */}
                <View style={styles.canteenChipsRow}>
                  {(['MAIN', 'ANNEX', 'KIOSK'] as CanteenId[]).map((cId) => (
                    <TouchableOpacity
                      key={cId}
                      style={[
                        styles.canteenChip,
                        selectedCanteenId === cId && styles.canteenChipActive,
                      ]}
                      onPress={() => setSelectedCanteenId(cId)}
                    >
                      <Text
                        style={[
                          styles.canteenChipText,
                          selectedCanteenId === cId && styles.canteenChipTextActive,
                        ]}
                      >
                        {cId === 'MAIN' ? 'Main IM Canteen' : cId === 'ANNEX' ? 'Campus Annex' : 'Coffee Kiosk'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Selected Canteen Detail Card */}
                <View style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.canteenName}>{selectedCanteen.name}</Text>
                      <Text style={styles.canteenTagline}>{selectedCanteen.tagline}</Text>
                    </View>
                    <View
                      style={[
                        styles.queueBadge,
                        {
                          backgroundColor:
                            canteenStatus?.currentCrowdLevel === 'PEAK'
                              ? 'rgba(239, 68, 68, 0.2)'
                              : canteenStatus?.currentCrowdLevel === 'LOW'
                              ? 'rgba(16, 185, 129, 0.2)'
                              : 'rgba(245, 158, 11, 0.2)',
                          borderColor:
                            canteenStatus?.currentCrowdLevel === 'PEAK'
                              ? '#EF4444'
                              : canteenStatus?.currentCrowdLevel === 'LOW'
                              ? '#10B981'
                              : '#F59E0B',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.queueBadgeText,
                          {
                            color:
                              canteenStatus?.currentCrowdLevel === 'PEAK'
                                ? '#F87171'
                                : canteenStatus?.currentCrowdLevel === 'LOW'
                                ? '#34D399'
                                : '#FBBF24',
                          },
                        ]}
                      >
                        {canteenStatus?.currentCrowdLevel} QUEUE ({canteenStatus?.crowdPercentage}%)
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.canteenMsg}>{canteenStatus?.statusMessage}</Text>

                  {/* Highlights Grid */}
                  <View style={styles.infoGridRow}>
                    <View style={styles.infoCol}>
                      <Text style={styles.infoLabel}>Hours</Text>
                      <Text style={styles.infoVal}>{selectedCanteen.operatingHours}</Text>
                    </View>
                    <View style={styles.infoCol}>
                      <Text style={styles.infoLabel}>Lunch Serving Window</Text>
                      <Text style={styles.infoVal}>{selectedCanteen.lunchWindow}</Text>
                    </View>
                  </View>

                  <View style={styles.infoGridRow}>
                    <View style={styles.infoCol}>
                      <Text style={styles.infoLabel}>Optimal Visit Time</Text>
                      <Text style={styles.infoVal}>{canteenStatus?.recommendedTime}</Text>
                    </View>
                    <View style={styles.infoCol}>
                      <Text style={styles.infoLabel}>Next Rush Window</Text>
                      <Text style={styles.infoVal}>{canteenStatus?.nextRushHour}</Text>
                    </View>
                  </View>

                  {/* Food & Meal Notice */}
                  <View style={styles.foodNoticeBox}>
                    <Text style={styles.foodNoticeTitle}>Current Food Availability:</Text>
                    <Text style={styles.foodNoticeBody}>
                      No breakfast served. Hot Lunch served strictly between 12:30 PM and 02:00 PM. Hot filter coffee, tea, fresh fruit juices, and evening snacks available throughout the day.
                    </Text>
                  </View>

                  {/* Specialties List */}
                  <View style={styles.specialtiesBox}>
                    <Text style={styles.specialtiesTitle}>Menu Specialties:</Text>
                    <View style={styles.specialtiesRow}>
                      {selectedCanteen.specialties.map((item, idx) => (
                        <View key={idx} style={styles.specialtyChip}>
                          <Text style={styles.specialtyChipText}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Sub-view B: XEROX & REPROGRAPHY HUB */}
            {canteenSubTab === 'XEROX' && (
              <View>
                {/* Status Card */}
                <View style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.canteenName}>Campus Xerox & Reprography Shop</Text>
                      <Text style={styles.canteenTagline}>Assignments, Project Binding, Color & B&W Printing</Text>
                    </View>
                    <View
                      style={[
                        styles.queueBadge,
                        {
                          backgroundColor:
                            xeroxStatus?.currentCrowdLevel === 'PEAK'
                              ? 'rgba(239, 68, 68, 0.2)'
                              : xeroxStatus?.currentCrowdLevel === 'LOW'
                              ? 'rgba(16, 185, 129, 0.2)'
                              : 'rgba(245, 158, 11, 0.2)',
                          borderColor:
                            xeroxStatus?.currentCrowdLevel === 'PEAK'
                              ? '#EF4444'
                              : xeroxStatus?.currentCrowdLevel === 'LOW'
                              ? '#10B981'
                              : '#F59E0B',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.queueBadgeText,
                          {
                            color:
                              xeroxStatus?.currentCrowdLevel === 'PEAK'
                                ? '#F87171'
                                : xeroxStatus?.currentCrowdLevel === 'LOW'
                                ? '#34D399'
                                : '#FBBF24',
                          },
                        ]}
                      >
                        {xeroxStatus?.currentCrowdLevel} QUEUE
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.canteenMsg}>{xeroxStatus?.statusMessage}</Text>

                  <View style={styles.infoGridRow}>
                    <View style={styles.infoCol}>
                      <Text style={styles.infoLabel}>Estimated Queue Wait</Text>
                      <Text style={styles.infoVal}>~{xeroxStatus?.estimatedWaitMinutes} mins</Text>
                    </View>
                    <View style={styles.infoCol}>
                      <Text style={styles.infoLabel}>Recommended Window</Text>
                      <Text style={styles.infoVal}>{xeroxStatus?.recommendedTime}</Text>
                    </View>
                  </View>

                  {/* Standard Rate Card */}
                  <View style={styles.rateCardBox}>
                    <Text style={styles.rateCardTitle}>Standard Rate Card</Text>
                    <View style={styles.rateGrid}>
                      <Text style={styles.rateItem}>B&W Single: Rs. {DEFAULT_XEROX_RATES.bwSingle}/page</Text>
                      <Text style={styles.rateItem}>B&W Back-to-Back: Rs. {DEFAULT_XEROX_RATES.bwDouble}/sheet</Text>
                      <Text style={styles.rateItem}>Color Print: Rs. {DEFAULT_XEROX_RATES.colorSingle}/page</Text>
                      <Text style={styles.rateItem}>Spiral Binding: Rs. {DEFAULT_XEROX_RATES.spiralBinding}</Text>
                    </View>
                  </View>
                </View>

                {/* Instant Print Cost Calculator */}
                <View style={styles.card}>
                  <Text style={styles.calculatorTitle}>Zero-Queue Print & Collect Calculator</Text>
                  <Text style={styles.calculatorSubtitle}>
                    Calculate the total, scan the shop QR to pay, and send the document via WhatsApp. Walk in and pick up your ready printout!
                  </Text>

                  {/* Inputs */}
                  <View style={styles.inputGrid}>
                    <View style={styles.inputCol}>
                      <Text style={styles.inputLabel}>Total Pages</Text>
                      <TextInput
                        style={styles.textInput}
                        keyboardType="numeric"
                        value={xeroxPages}
                        onChangeText={setXeroxPages}
                        placeholderTextColor="#8E9BB0"
                      />
                    </View>

                    <View style={styles.inputCol}>
                      <Text style={styles.inputLabel}>No. of Copies</Text>
                      <TextInput
                        style={styles.textInput}
                        keyboardType="numeric"
                        value={xeroxCopies}
                        onChangeText={setXeroxCopies}
                        placeholderTextColor="#8E9BB0"
                      />
                    </View>
                  </View>

                  {/* Toggles */}
                  <View style={styles.toggleRow}>
                    <TouchableOpacity
                      style={[styles.toggleBtn, !isColor && styles.toggleBtnActive]}
                      onPress={() => setIsColor(false)}
                    >
                      <Text style={[styles.toggleBtnText, !isColor && styles.toggleBtnTextActive]}>
                        B&W
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.toggleBtn, isColor && styles.toggleBtnActive]}
                      onPress={() => setIsColor(true)}
                    >
                      <Text style={[styles.toggleBtnText, isColor && styles.toggleBtnTextActive]}>
                        Color Print
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {!isColor && (
                    <View style={styles.toggleRow}>
                      <TouchableOpacity
                        style={[styles.toggleBtn, !isDoubleSided && styles.toggleBtnActive]}
                        onPress={() => setIsDoubleSided(false)}
                      >
                        <Text style={[styles.toggleBtnText, !isDoubleSided && styles.toggleBtnTextActive]}>
                          Single Sided
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.toggleBtn, isDoubleSided && styles.toggleBtnActive]}
                        onPress={() => setIsDoubleSided(true)}
                      >
                        <Text style={[styles.toggleBtnText, isDoubleSided && styles.toggleBtnTextActive]}>
                          Double Sided (Back-to-Back)
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Binding Selector */}
                  <Text style={[styles.inputLabel, { marginTop: 12 }]}>Binding / Finishing</Text>
                  <View style={styles.toggleRow}>
                    <TouchableOpacity
                      style={[styles.toggleBtn, bindingType === 'NONE' && styles.toggleBtnActive]}
                      onPress={() => setBindingType('NONE')}
                    >
                      <Text style={[styles.toggleBtnText, bindingType === 'NONE' && styles.toggleBtnTextActive]}>
                        None / Stapled
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.toggleBtn, bindingType === 'SPIRAL' && styles.toggleBtnActive]}
                      onPress={() => setBindingType('SPIRAL')}
                    >
                      <Text style={[styles.toggleBtnText, bindingType === 'SPIRAL' && styles.toggleBtnTextActive]}>
                        Spiral (+Rs. 25)
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.toggleBtn, bindingType === 'FOLDER' && styles.toggleBtnActive]}
                      onPress={() => setBindingType('FOLDER')}
                    >
                      <Text style={[styles.toggleBtnText, bindingType === 'FOLDER' && styles.toggleBtnTextActive]}>
                        Folder (+Rs. 10)
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Total Display */}
                  <View style={styles.totalBox}>
                    <View>
                      <Text style={styles.totalLabel}>Calculated Print Total</Text>
                      <Text style={styles.totalNote}>Inclusive of all pages & finishing</Text>
                    </View>
                    <Text style={styles.totalAmount}>Rs. {calculatedTotal}</Text>
                  </View>

                  {/* Actions */}
                  <View style={styles.xeroxActionRow}>
                    <TouchableOpacity
                      style={styles.qrBtn}
                      onPress={() => setShowQrModal(!showQrModal)}
                    >
                      <Text style={styles.qrBtnText}>
                        {showQrModal ? 'Hide Shop UPI QR' : 'Show Shop UPI QR'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.sendWhatsAppBtn}
                      onPress={handleSendToWhatsApp}
                    >
                      <Text style={styles.sendWhatsAppBtnText}>Send via WhatsApp</Text>
                    </TouchableOpacity>
                  </View>

                  {/* QR Box View */}
                  {showQrModal && (
                    <View style={styles.qrDisplayCard}>
                      <Text style={styles.qrCardTitle}>Campus Xerox UPI Pay</Text>
                      <Text style={styles.qrCardSubtitle}>Scan with GPay / PhonePe / Paytm</Text>
                      <View style={styles.mockQrPlaceholder}>
                        <Text style={styles.mockQrText}>[ SHOP UPI QR CODE ]</Text>
                        <Text style={styles.mockQrSub}>Pay Exactly: Rs. {calculatedTotal}</Text>
                      </View>
                      <Text style={styles.qrInstructions}>
                        After paying, take a screenshot and tap "Send via WhatsApp" above to forward your PDF and payment confirmation.
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        )}

        {/* ============================================================ */}
        {/* 3. FACULTY OFFICE HOURS BOOKING */}
        {/* ============================================================ */}
        {activeSection === 'FACULTY' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Faculty Office Consultation</Text>
              <Text style={styles.sectionCaption}>
                Reserve 1-on-1 consultation slots for doubt clearance, academic guidance, or project reviews.
              </Text>
            </View>

            {facultySlots.map((fac) => (
              <View key={fac.id} style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.facName}>{fac.facultyName}</Text>
                    <Text style={styles.facSubject}>
                      {fac.subjectName} ({fac.subjectCode})
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.availBadge,
                      {
                        backgroundColor: fac.isAvailable
                          ? 'rgba(16, 185, 129, 0.2)'
                          : 'rgba(239, 68, 68, 0.2)',
                        borderColor: fac.isAvailable ? '#10B981' : '#EF4444',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.availBadgeText,
                        { color: fac.isAvailable ? '#34D399' : '#F87171' },
                      ]}
                    >
                      {fac.isAvailable ? 'AVAILABLE' : 'RESERVED'}
                    </Text>
                  </View>
                </View>

                <View style={styles.facDetailsRow}>
                  <Text style={styles.facDetailItem}>Day: {fac.day}</Text>
                  <Text style={styles.facDetailItem}>Time: {fac.timing}</Text>
                </View>
                <Text style={styles.facCabin}>Cabin: {fac.cabin}</Text>

                <TouchableOpacity
                  style={[styles.bookSlotBtn, !fac.isAvailable && styles.bookSlotBtnDisabled]}
                  disabled={!fac.isAvailable}
                  onPress={() => handleBookSlot(fac)}
                >
                  <Text style={styles.bookSlotBtnText}>
                    {fac.isAvailable ? 'Reserve Consultation Slot' : 'Slot Confirmed'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* ============================================================ */}
        {/* 4. SYLLABUS VELOCITY TRACKER */}
        {/* ============================================================ */}
        {activeSection === 'SYLLABUS' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Syllabus Velocity Tracker</Text>
              <Text style={styles.sectionCaption}>
                Tracks planned curriculum delivery rate vs. remaining lecture weeks before Nov 27 cut-off date.
              </Text>
            </View>

            {syllabusList.map((item) => (
              <View key={item.subjectCode} style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sylCode}>{item.subjectCode}</Text>
                    <Text style={styles.sylTitle}>{item.subjectTitle}</Text>
                  </View>
                  <View
                    style={[
                      styles.queueBadge,
                      {
                        backgroundColor:
                          item.velocityStatus === 'ON_TRACK'
                            ? 'rgba(16, 185, 129, 0.2)'
                            : item.velocityStatus === 'ACCELERATED'
                            ? 'rgba(59, 130, 246, 0.2)'
                            : 'rgba(239, 68, 68, 0.2)',
                        borderColor:
                          item.velocityStatus === 'ON_TRACK'
                            ? '#10B981'
                            : item.velocityStatus === 'ACCELERATED'
                            ? '#3B82F6'
                            : '#EF4444',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.queueBadgeText,
                        {
                          color:
                            item.velocityStatus === 'ON_TRACK'
                              ? '#34D399'
                              : item.velocityStatus === 'ACCELERATED'
                              ? '#60A5FA'
                              : '#F87171',
                        },
                      ]}
                    >
                      {item.velocityStatus}
                    </Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBarTrack}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${Math.min(100, item.completionPercentage)}%` },
                    ]}
                  />
                </View>

                <View style={styles.sylMetricsGrid}>
                  <View style={styles.sylCol}>
                    <Text style={styles.sylMetricLabel}>Completed</Text>
                    <Text style={styles.sylMetricVal}>
                      {item.completedSessions} / {item.totalPlannedSessions}
                    </Text>
                  </View>
                  <View style={styles.sylCol}>
                    <Text style={styles.sylMetricLabel}>Progress</Text>
                    <Text style={styles.sylMetricVal}>{item.completionPercentage}%</Text>
                  </View>
                  <View style={styles.sylCol}>
                    <Text style={styles.sylMetricLabel}>Pace Needed</Text>
                    <Text style={styles.sylMetricVal}>{item.expectedPacePerWeek} ses/wk</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ============================================================ */}
        {/* 5. LIBRARY SHIELD */}
        {/* ============================================================ */}
        {activeSection === 'LIBRARY' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Library Shield & Renewals</Text>
              <Text style={styles.sectionCaption}>
                Track borrowed volumes, accession barcodes, return due dates, and execute 1-tap online renewals.
              </Text>
            </View>

            {libraryBooks.map((book) => (
              <View key={book.id} style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bookTitle}>{book.title}</Text>
                    <Text style={styles.bookAuthor}>Author: {book.author}</Text>
                    <Text style={styles.bookAccession}>Accession: {book.accessionNo}</Text>
                  </View>
                  <View
                    style={[
                      styles.queueBadge,
                      {
                        backgroundColor:
                          book.daysRemaining <= 1
                            ? 'rgba(239, 68, 68, 0.2)'
                            : 'rgba(16, 185, 129, 0.2)',
                        borderColor: book.daysRemaining <= 1 ? '#EF4444' : '#10B981',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.queueBadgeText,
                        { color: book.daysRemaining <= 1 ? '#F87171' : '#34D399' },
                      ]}
                    >
                      {book.daysRemaining} DAYS LEFT
                    </Text>
                  </View>
                </View>

                <View style={styles.infoGridRow}>
                  <View style={styles.infoCol}>
                    <Text style={styles.infoLabel}>Borrowed Date</Text>
                    <Text style={styles.infoVal}>{book.borrowedDate}</Text>
                  </View>
                  <View style={styles.infoCol}>
                    <Text style={styles.infoLabel}>Due Date</Text>
                    <Text style={styles.infoVal}>{book.dueDate}</Text>
                  </View>
                </View>

                {book.canRenewOnline && (
                  <TouchableOpacity
                    style={styles.bookRenewBtn}
                    onPress={() => handleRenewBook(book.id)}
                  >
                    <Text style={styles.bookRenewBtnText}>Renew Online (+14 Days)</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B132B',
  },
  topHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#1C2541',
    borderBottomWidth: 1.5,
    borderBottomColor: '#2A3B5C',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#F4E8C1',
    letterSpacing: 1.1,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#C5BA9D',
    marginTop: 2,
  },
  badgeLive: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  badgeLiveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: 0.8,
  },
  noticeBanner: {
    backgroundColor: 'rgba(244, 232, 193, 0.15)',
    borderBottomWidth: 1,
    borderBottomColor: '#F4E8C1',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  noticeText: {
    color: '#F4E8C1',
    fontSize: 12,
    fontWeight: '700',
  },
  navBarWrapper: {
    backgroundColor: '#1C2541',
    borderBottomWidth: 1,
    borderBottomColor: '#2A3B5C',
  },
  navBarContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    gap: 8,
  },
  navPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#0B132B',
    borderWidth: 1,
    borderColor: '#2A3B5C',
  },
  navPillActive: {
    backgroundColor: '#F4E8C1',
    borderColor: '#F4E8C1',
  },
  navPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E9BB0',
  },
  navPillTextActive: {
    color: '#0B132B',
    fontWeight: '900',
  },
  scrollContent: {
    flex: 1,
  },
  scrollInner: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F4E8C1',
  },
  sectionCaption: {
    fontSize: 12,
    color: '#C5BA9D',
    marginTop: 4,
    lineHeight: 17,
  },
  newsSyncBar: {
    marginTop: 10,
    backgroundColor: '#0B132B',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#2A3B5C',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  newsSyncInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  syncPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  newsSyncText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F4E8C1',
    letterSpacing: 0.5,
  },
  newsRefreshBtn: {
    backgroundColor: 'rgba(244, 232, 193, 0.15)',
    borderWidth: 1,
    borderColor: '#F4E8C1',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  newsRefreshBtnActive: {
    backgroundColor: '#2A3B5C',
  },
  newsRefreshBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#F4E8C1',
    letterSpacing: 0.8,
  },
  card: {
    backgroundColor: '#1C2541',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#2A3B5C',
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  newsSource: {
    fontSize: 11,
    fontWeight: '900',
    color: '#F4E8C1',
    letterSpacing: 0.8,
  },
  newsDate: {
    fontSize: 11,
    color: '#8E9BB0',
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F4E8C1',
    marginBottom: 6,
    lineHeight: 20,
  },
  newsSummary: {
    fontSize: 12,
    color: '#C5BA9D',
    lineHeight: 18,
    marginBottom: 10,
  },
  takeawayBox: {
    backgroundColor: '#0B132B',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#F4E8C1',
    marginBottom: 10,
  },
  takeawayLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F4E8C1',
    marginBottom: 2,
  },
  takeawayText: {
    fontSize: 12,
    color: '#C5BA9D',
    lineHeight: 17,
  },
  newsReadMoreBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  newsReadMoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F4E8C1',
    textDecorationLine: 'underline',
  },
  subTabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  subTabBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#1C2541',
    borderWidth: 1,
    borderColor: '#2A3B5C',
    alignItems: 'center',
  },
  subTabBtnActive: {
    backgroundColor: '#2A3B5C',
    borderColor: '#F4E8C1',
  },
  subTabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E9BB0',
  },
  subTabBtnTextActive: {
    color: '#F4E8C1',
    fontWeight: '800',
  },
  canteenChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  canteenChip: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 6,
    backgroundColor: '#0B132B',
    borderWidth: 1,
    borderColor: '#2A3B5C',
    alignItems: 'center',
  },
  canteenChipActive: {
    backgroundColor: 'rgba(244, 232, 193, 0.15)',
    borderColor: '#F4E8C1',
  },
  canteenChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E9BB0',
  },
  canteenChipTextActive: {
    color: '#F4E8C1',
    fontWeight: '800',
  },
  canteenName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F4E8C1',
  },
  canteenTagline: {
    fontSize: 11,
    color: '#8E9BB0',
    marginTop: 2,
  },
  queueBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  queueBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  canteenMsg: {
    fontSize: 12,
    color: '#C5BA9D',
    marginTop: 8,
    marginBottom: 12,
    lineHeight: 18,
  },
  infoGridRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  infoCol: {
    flex: 1,
    backgroundColor: '#0B132B',
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: '#2A3B5C',
  },
  infoLabel: {
    fontSize: 10,
    color: '#8E9BB0',
    marginBottom: 2,
  },
  infoVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F4E8C1',
  },
  foodNoticeBox: {
    backgroundColor: 'rgba(244, 232, 193, 0.08)',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#F4E8C1',
    marginTop: 6,
    marginBottom: 10,
  },
  foodNoticeTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F4E8C1',
    marginBottom: 2,
  },
  foodNoticeBody: {
    fontSize: 11,
    color: '#C5BA9D',
    lineHeight: 16,
  },
  specialtiesBox: {
    marginTop: 6,
  },
  specialtiesTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F4E8C1',
    marginBottom: 6,
  },
  specialtiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  specialtyChip: {
    backgroundColor: '#0B132B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#2A3B5C',
  },
  specialtyChipText: {
    fontSize: 10,
    color: '#C5BA9D',
  },
  rateCardBox: {
    backgroundColor: '#0B132B',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#2A3B5C',
    marginTop: 10,
  },
  rateCardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F4E8C1',
    marginBottom: 6,
  },
  rateGrid: {
    gap: 4,
  },
  rateItem: {
    fontSize: 11,
    color: '#C5BA9D',
  },
  calculatorTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F4E8C1',
    marginBottom: 4,
  },
  calculatorSubtitle: {
    fontSize: 11,
    color: '#8E9BB0',
    lineHeight: 16,
    marginBottom: 14,
  },
  inputGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  inputCol: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F4E8C1',
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#0B132B',
    borderWidth: 1,
    borderColor: '#2A3B5C',
    borderRadius: 8,
    color: '#F4E8C1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#0B132B',
    borderWidth: 1,
    borderColor: '#2A3B5C',
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: 'rgba(244, 232, 193, 0.15)',
    borderColor: '#F4E8C1',
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E9BB0',
  },
  toggleBtnTextActive: {
    color: '#F4E8C1',
    fontWeight: '800',
  },
  totalBox: {
    backgroundColor: '#0B132B',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#F4E8C1',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 14,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F4E8C1',
  },
  totalNote: {
    fontSize: 10,
    color: '#8E9BB0',
    marginTop: 2,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: '#F4E8C1',
  },
  xeroxActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  qrBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#2A3B5C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F4E8C1',
  },
  sendWhatsAppBtn: {
    flex: 1.2,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendWhatsAppBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  qrDisplayCard: {
    backgroundColor: '#0B132B',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2A3B5C',
    marginTop: 14,
    alignItems: 'center',
  },
  qrCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F4E8C1',
  },
  qrCardSubtitle: {
    fontSize: 11,
    color: '#8E9BB0',
    marginTop: 2,
    marginBottom: 12,
  },
  mockQrPlaceholder: {
    width: 180,
    height: 180,
    backgroundColor: '#1C2541',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#F4E8C1',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  mockQrText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#F4E8C1',
    letterSpacing: 1,
  },
  mockQrSub: {
    fontSize: 11,
    color: '#34D399',
    marginTop: 8,
    fontWeight: '700',
  },
  qrInstructions: {
    fontSize: 10,
    color: '#C5BA9D',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 15,
  },
  facName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F4E8C1',
  },
  facSubject: {
    fontSize: 11,
    color: '#8E9BB0',
    marginTop: 2,
  },
  availBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  availBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  facDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  facDetailItem: {
    fontSize: 11,
    color: '#C5BA9D',
  },
  facCabin: {
    fontSize: 11,
    color: '#8E9BB0',
    marginTop: 4,
    marginBottom: 10,
  },
  bookSlotBtn: {
    backgroundColor: '#F4E8C1',
    paddingVertical: 9,
    borderRadius: 6,
    alignItems: 'center',
  },
  bookSlotBtnDisabled: {
    backgroundColor: '#2A3B5C',
  },
  bookSlotBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0B132B',
  },
  sylCode: {
    fontSize: 12,
    fontWeight: '900',
    color: '#F4E8C1',
  },
  sylTitle: {
    fontSize: 13,
    color: '#C5BA9D',
    marginTop: 2,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#0B132B',
    borderRadius: 4,
    marginTop: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F4E8C1',
    borderRadius: 4,
  },
  sylMetricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sylCol: {
    alignItems: 'center',
  },
  sylMetricLabel: {
    fontSize: 10,
    color: '#8E9BB0',
  },
  sylMetricVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F4E8C1',
    marginTop: 2,
  },
  bookTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F4E8C1',
  },
  bookAuthor: {
    fontSize: 11,
    color: '#C5BA9D',
    marginTop: 2,
  },
  bookAccession: {
    fontSize: 10,
    color: '#8E9BB0',
    marginTop: 1,
  },
  bookRenewBtn: {
    marginTop: 10,
    backgroundColor: '#2A3B5C',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F4E8C1',
  },
  bookRenewBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F4E8C1',
  },
});
