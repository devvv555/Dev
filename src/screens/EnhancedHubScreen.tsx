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
  Modal,
} from 'react-native';
import {
  BusinessNewsService,
  NewsArticle,
} from '../services/businessNewsService';
import {
  MarketQuotesService,
  MarketQuote,
  DaystarterBriefing,
} from '../services/marketQuotesService';
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
import {
  CanteenLocationMeshService,
  LiveLocationStatus,
  LiveCrowdMeshMetrics,
  CANTEEN_GEOLOCATIONS,
} from '../services/canteenLocationMeshService';

export interface EnhancedHubScreenProps {
  studentRollNo: string;
  studentName: string;
  onRefresh?: () => void;
  isEnhancedSuit?: boolean;
  isLightMode?: boolean;
}

type HubSection = 'NEWS' | 'CANTEEN_XEROX' | 'FACULTY' | 'SYLLABUS' | 'LIBRARY';

export const EnhancedHubScreen: React.FC<EnhancedHubScreenProps> = ({
  studentRollNo,
  studentName,
  isEnhancedSuit = true,
  isLightMode = false,
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

  // Live Market Quotes & Daystarter State
  const [marketQuotes, setMarketQuotes] = useState<MarketQuote[]>([]);
  const [daystarter, setDaystarter] = useState<DaystarterBriefing | null>(null);
  const [quoteCategoryFilter, setQuoteCategoryFilter] = useState<'ALL' | 'INDEX' | 'STOCK' | 'COMMODITY'>('ALL');

  const [canteenStatus, setCanteenStatus] = useState<CanteenRushStatus | null>(null);
  const [liveLocation, setLiveLocation] = useState<LiveLocationStatus | null>(null);
  const [liveCrowdMetrics, setLiveCrowdMetrics] = useState<LiveCrowdMeshMetrics | null>(null);
  const [isScanningGps, setIsScanningGps] = useState<boolean>(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState<boolean>(false);
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
  const [showWalkthrough, setShowWalkthrough] = useState<boolean>(false);
  const [walkthroughStep, setWalkthroughStep] = useState<number>(0);

  // Status message / booking confirmation
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, [selectedCanteenId]);

  // Subscribe to Live Crowd Mesh via Firestore for selected canteen spot
  useEffect(() => {
    const baseline = CampusLifeFeaturesEngine.getCanteenRushStatus(selectedCanteenId);
    const unsubscribe = CanteenLocationMeshService.subscribeToLiveCrowdMesh(
      selectedCanteenId,
      baseline.crowdPercentage,
      baseline.currentCrowdLevel,
      (metrics) => {
        setLiveCrowdMetrics(metrics);
      }
    );
    return () => unsubscribe();
  }, [selectedCanteenId]);

  // Auto-scan location when opening Canteen section in Enhanced Suit mode
  useEffect(() => {
    if (activeSection === 'CANTEEN_XEROX' && canteenSubTab === 'CANTEEN') {
      handleScanLocation();
    }
  }, [activeSection, canteenSubTab, selectedCanteenId]);

  const handleScanLocation = async () => {
    setIsScanningGps(true);
    try {
      const loc = await CanteenLocationMeshService.checkCanteenLocation(selectedCanteenId);
      setLiveLocation(loc);
    } catch (e) {
      console.warn('GPS Scan error:', e);
    } finally {
      setIsScanningGps(false);
    }
  };

  const handleReportCrowd = async (level: 'LOW' | 'MODERATE' | 'PEAK') => {
    setIsSubmittingReport(true);
    const success = await CanteenLocationMeshService.submitStudentRushReport(selectedCanteenId, level);
    setIsSubmittingReport(false);
    if (success) {
      setActionNotice(`✅ Verified crowd report submitted (${level} Rush). Thank you!`);
      setTimeout(() => setActionNotice(null), 3500);
    } else {
      Alert.alert('Report Error', 'Could not record report. Check connection.');
    }
  };

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
    setMarketQuotes(MarketQuotesService.getQuotes());
    setDaystarter(MarketQuotesService.getDaystarterBriefing());
    setNewsLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setNewsCountdownSeconds(BusinessNewsService.getRefreshIntervalSeconds());
    if (manual) {
      setActionNotice('Live Business News & Stock Quotes refreshed successfully.');
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
    setMarketQuotes(MarketQuotesService.getQuotes());
    setDaystarter(MarketQuotesService.getDaystarterBriefing());
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
  const styles = getStyles(isLightMode);

  return (
    <View style={[styles.container, isLightMode && { backgroundColor: '#F1F5F9' }]}>
      {/* Top Section Header */}
      <View
        style={[
          styles.topHeader,
          isLightMode && {
            backgroundColor: '#FFFFFF',
            borderBottomColor: '#E2E8F0',
          },
        ]}
      >
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text
            style={[
              styles.headerTitle,
              isLightMode && { color: '#0F172A', fontWeight: '900' },
            ]}
          >
            LEVEL ONE HUB
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              isLightMode && { color: '#64748B' },
            ]}
            numberOfLines={1}
          >
            Autonomous Campus Intelligence & Student Amenities
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity
            style={[
              {
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 8,
                backgroundColor: isLightMode ? '#EFF6FF' : 'rgba(56, 189, 248, 0.15)',
                borderWidth: 1,
                borderColor: isLightMode ? '#93C5FD' : '#38BDF8',
              },
            ]}
            onPress={() => {
              setWalkthroughStep(0);
              setShowWalkthrough(true);
            }}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 13 }}>🧭</Text>
            <Text
              style={{
                fontSize: 11,
                fontWeight: '800',
                color: isLightMode ? '#1D4ED8' : '#38BDF8',
              }}
            >
              Walkthrough
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Notification Banner */}
      {actionNotice && (
        <View
          style={[
            styles.noticeBanner,
            isLightMode && {
              backgroundColor: '#EFF6FF',
              borderBottomColor: '#BFDBFE',
            },
          ]}
        >
          <Text
            style={[
              styles.noticeText,
              isLightMode && { color: '#1E40AF', fontWeight: '700' },
            ]}
          >
            {actionNotice}
          </Text>
        </View>
      )}

      {/* Section Filter Pills */}
      <View
        style={[
          styles.navBarWrapper,
          isLightMode && {
            backgroundColor: '#FFFFFF',
            borderBottomColor: '#E2E8F0',
          },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.navBarContent}
        >
          <TouchableOpacity
            style={[
              styles.navPill,
              isLightMode && {
                backgroundColor: '#F8FAFC',
                borderColor: '#E2E8F0',
              },
              activeSection === 'NEWS' &&
                (isLightMode
                  ? { backgroundColor: '#2B3990', borderColor: '#2B3990' }
                  : styles.navPillActive),
            ]}
            onPress={() => setActiveSection('NEWS')}
          >
            <Text
              style={[
                styles.navPillText,
                isLightMode && { color: '#64748B' },
                activeSection === 'NEWS' &&
                  (isLightMode
                    ? { color: '#FFFFFF', fontWeight: '800' }
                    : styles.navPillTextActive),
              ]}
            >
              Live News Feed
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navPill,
              isLightMode && {
                backgroundColor: '#F8FAFC',
                borderColor: '#E2E8F0',
              },
              activeSection === 'CANTEEN_XEROX' &&
                (isLightMode
                  ? { backgroundColor: '#2B3990', borderColor: '#2B3990' }
                  : styles.navPillActive),
            ]}
            onPress={() => setActiveSection('CANTEEN_XEROX')}
          >
            <Text
              style={[
                styles.navPillText,
                isLightMode && { color: '#64748B' },
                activeSection === 'CANTEEN_XEROX' &&
                  (isLightMode
                    ? { color: '#FFFFFF', fontWeight: '800' }
                    : styles.navPillTextActive),
              ]}
            >
              Canteen & Xerox Radar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navPill,
              isLightMode && {
                backgroundColor: '#F8FAFC',
                borderColor: '#E2E8F0',
              },
              activeSection === 'FACULTY' &&
                (isLightMode
                  ? { backgroundColor: '#2B3990', borderColor: '#2B3990' }
                  : styles.navPillActive),
            ]}
            onPress={() => setActiveSection('FACULTY')}
          >
            <Text
              style={[
                styles.navPillText,
                isLightMode && { color: '#64748B' },
                activeSection === 'FACULTY' &&
                  (isLightMode
                    ? { color: '#FFFFFF', fontWeight: '800' }
                    : styles.navPillTextActive),
              ]}
            >
              Faculty Office Booking
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navPill,
              isLightMode && {
                backgroundColor: '#F8FAFC',
                borderColor: '#E2E8F0',
              },
              activeSection === 'SYLLABUS' &&
                (isLightMode
                  ? { backgroundColor: '#2B3990', borderColor: '#2B3990' }
                  : styles.navPillActive),
            ]}
            onPress={() => setActiveSection('SYLLABUS')}
          >
            <Text
              style={[
                styles.navPillText,
                isLightMode && { color: '#64748B' },
                activeSection === 'SYLLABUS' &&
                  (isLightMode
                    ? { color: '#FFFFFF', fontWeight: '800' }
                    : styles.navPillTextActive),
              ]}
            >
              Syllabus Velocity
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navPill,
              isLightMode && {
                backgroundColor: '#F8FAFC',
                borderColor: '#E2E8F0',
              },
              activeSection === 'LIBRARY' &&
                (isLightMode
                  ? { backgroundColor: '#2B3990', borderColor: '#2B3990' }
                  : styles.navPillActive),
            ]}
            onPress={() => setActiveSection('LIBRARY')}
          >
            <Text
              style={[
                styles.navPillText,
                isLightMode && { color: '#64748B' },
                activeSection === 'LIBRARY' &&
                  (isLightMode
                    ? { color: '#FFFFFF', fontWeight: '800' }
                    : styles.navPillTextActive),
              ]}
            >
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

            {/* ============================================================ */}
            {/* LIVE MARKET PULSE & INDICES TICKER */}
            {/* ============================================================ */}
            <View style={styles.marketTickerCard}>
              <View style={styles.marketTickerHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={[styles.marketStatusIndicator, { backgroundColor: MarketQuotesService.getMarketSessionText().badgeColor }]} />
                  <Text style={styles.marketTickerTitle}>
                    {MarketQuotesService.getMarketSessionText().text}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => Linking.openURL('https://www.nseindia.com')}>
                  <Text style={styles.marketSourceTag}>Source: NSE / BSE ↗</Text>
                </TouchableOpacity>
              </View>

              {/* Category Pills */}
              <View style={styles.quotePillRow}>
                {(['ALL', 'INDEX', 'STOCK', 'COMMODITY'] as const).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.quotePill, quoteCategoryFilter === cat && styles.quotePillActive]}
                    onPress={() => setQuoteCategoryFilter(cat)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.quotePillText, quoteCategoryFilter === cat && styles.quotePillTextActive]}>
                      {cat === 'ALL' ? 'Watchlist' : cat === 'INDEX' ? 'Indices' : cat === 'STOCK' ? 'MBA Stocks' : 'Commodities'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Horizontal Scrollable Quotes Bar */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quotesScrollContainer}>
                {marketQuotes
                  .filter((q) => quoteCategoryFilter === 'ALL' || q.category === quoteCategoryFilter)
                  .map((q) => {
                    const isPositive = q.change >= 0;
                    return (
                      <TouchableOpacity
                        key={q.symbol}
                        style={styles.quoteCard}
                        onPress={() => Linking.openURL(q.sourceUrl)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.quoteCardTop}>
                          <Text style={styles.quoteSymbol}>{q.symbol}</Text>
                          <Text style={[styles.quoteBadge, isPositive ? styles.quoteBadgeUp : styles.quoteBadgeDown]}>
                            {isPositive ? '▲' : '▼'} {Math.abs(q.changePercent).toFixed(2)}%
                          </Text>
                        </View>
                        <Text style={styles.quoteName} numberOfLines={1}>{q.name}</Text>
                        <View style={styles.quotePriceRow}>
                          <Text style={styles.quotePrice}>
                            {q.currency === 'INR' ? '₹' : '$'}{q.price.toLocaleString('en-IN')}
                          </Text>
                          <Text style={[styles.quoteChange, isPositive ? styles.quoteTextUp : styles.quoteTextDown]}>
                            {isPositive ? '+' : ''}{q.change.toFixed(2)}
                          </Text>
                        </View>
                        <Text style={styles.quoteSourceText}>Source: {q.source}</Text>
                      </TouchableOpacity>
                    );
                  })}
              </ScrollView>
            </View>

            {/* ============================================================ */}
            {/* 08:00 AM DAILY DAYSTARTER EXECUTIVE BRIEFING */}
            {/* ============================================================ */}
            {daystarter && (
              <View style={styles.daystarterCard}>
                <View style={styles.daystarterHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.daystarterBadgeRow}>
                      <View style={styles.daystarterLiveBadge}>
                        <Text style={styles.daystarterLiveBadgeText}>🌅 08:00 AM BRIEFING</Text>
                      </View>
                      <Text style={styles.daystarterEditionDate}>{daystarter.editionDate}</Text>
                    </View>
                    <Text style={styles.daystarterHeadline}>{daystarter.headline}</Text>
                  </View>
                </View>

                {/* Explicit Source Attribution Banner */}
                <View style={styles.daystarterSourceBox}>
                  <Text style={styles.daystarterSourceLabel}>Official Sources & Citations:</Text>
                  <TouchableOpacity
                    style={styles.daystarterSourceLinkRow}
                    onPress={() => Linking.openURL(daystarter.sourceUrl)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.daystarterSourceLink}>
                      🔗 {daystarter.sourceName} • {daystarter.volumeNo} ↗
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.daystarterSummaryText}>{daystarter.marketSummary}</Text>

                {/* 3 Core Anchor Stats Grid */}
                <View style={styles.anchorStatsGrid}>
                  {daystarter.anchorStats.map((stat, idx) => (
                    <View key={idx} style={styles.anchorStatBox}>
                      <Text style={styles.anchorStatLabel}>{stat.label}</Text>
                      <Text style={styles.anchorStatValue}>{stat.value}</Text>
                      <Text style={[styles.anchorStatChange, stat.isPositive ? styles.quoteTextUp : styles.quoteTextDown]}>
                        {stat.changeText}
                      </Text>
                      <Text style={styles.anchorStatSubtext} numberOfLines={2}>{stat.subtext}</Text>
                    </View>
                  ))}
                </View>

                {/* Institutional Cash Flows */}
                <View style={styles.flowsCard}>
                  <Text style={styles.flowsTitle}>📊 Institutional Cash Flows & Derivatives:</Text>
                  <View style={styles.flowsRow}>
                    <View style={styles.flowMetric}>
                      <Text style={styles.flowLabel}>FII Net Cash</Text>
                      <Text style={[styles.flowVal, { color: '#34D399' }]}>+₹{daystarter.fiiDiiFlows.fiiNetCr} Cr</Text>
                    </View>
                    <View style={styles.flowMetric}>
                      <Text style={styles.flowLabel}>DII Net Cash</Text>
                      <Text style={[styles.flowVal, { color: '#34D399' }]}>+₹{daystarter.fiiDiiFlows.diiNetCr} Cr</Text>
                    </View>
                    <View style={styles.flowMetric}>
                      <Text style={styles.flowLabel}>Options PCR</Text>
                      <Text style={[styles.flowVal, { color: '#38BDF8' }]}>{daystarter.fiiDiiFlows.optionsPcr}</Text>
                    </View>
                  </View>
                  <Text style={styles.flowsSourceText}>Source: {daystarter.fiiDiiFlows.source}</Text>
                </View>

                {/* Top Macro Pointers */}
                <View style={styles.macroPointersBox}>
                  <Text style={styles.macroPointersTitle}>🏛️ Key Macro & Regulatory Insights:</Text>
                  {daystarter.macroPointers.map((p, i) => (
                    <View key={i} style={styles.macroPointerItem}>
                      <Text style={styles.macroBullet}>•</Text>
                      <Text style={styles.macroPointerText}>{p}</Text>
                    </View>
                  ))}
                </View>

                {/* Corporate Earnings Highlights */}
                <View style={styles.corporateBox}>
                  <Text style={styles.corporateTitle}>🏢 Corporate Action & Results Scorecard:</Text>
                  {daystarter.corporateHighlights.map((corp, i) => (
                    <View key={i} style={styles.corporateItem}>
                      <View style={styles.corpHeaderRow}>
                        <Text style={styles.corpCompanyName}>{corp.company}</Text>
                        <View style={styles.corpTag}>
                          <Text style={styles.corpTagText}>{corp.tag}</Text>
                        </View>
                      </View>
                      <Text style={styles.corpResultText}>{corp.result}</Text>
                      <Text style={styles.corpDetailText}>{corp.detail}</Text>
                    </View>
                  ))}
                </View>

                {/* Read Full Edition Button */}
                <TouchableOpacity
                  style={styles.daystarterReadBtn}
                  onPress={() => Linking.openURL(daystarter.sourceUrl)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.daystarterReadBtnText}>
                    📖 Open Full Preparoo DayStarter Brief Edition ↗
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={{ marginTop: 10, marginBottom: 8 }}>
              <Text style={styles.sectionSubtitle}>📰 Business Press Feed & Managerial Analyses</Text>
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
                    onPress={() => {
                      if (item.articleUrl) {
                        Linking.openURL(item.articleUrl);
                      }
                    }}
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

                {/* Selected Canteen Detail Card with Stark Tactical GPS Mesh */}
                <View style={[styles.card, { borderColor: '#EAB308', borderWidth: 1.5 }]}>
                  <View style={styles.cardHeaderRow}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={styles.canteenName}>{selectedCanteen.name}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, marginBottom: 3 }}>
                        <View style={{ backgroundColor: 'rgba(234, 179, 8, 0.15)', borderColor: '#EAB308', borderWidth: 1, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start' }}>
                          <Text style={{ fontSize: 9.5, fontWeight: '800', color: isLightMode ? '#B45309' : '#EAB308' }}>TACTICAL MESH</Text>
                        </View>
                      </View>
                      <Text style={styles.canteenTagline}>{selectedCanteen.tagline}</Text>
                    </View>
                    <View
                      style={[
                        styles.queueBadge,
                        {
                          backgroundColor:
                            (liveCrowdMetrics?.crowdLevel || canteenStatus?.currentCrowdLevel) === 'PEAK'
                              ? 'rgba(239, 68, 68, 0.2)'
                              : (liveCrowdMetrics?.crowdLevel || canteenStatus?.currentCrowdLevel) === 'LOW'
                              ? 'rgba(16, 185, 129, 0.2)'
                              : 'rgba(245, 158, 11, 0.2)',
                          borderColor:
                            (liveCrowdMetrics?.crowdLevel || canteenStatus?.currentCrowdLevel) === 'PEAK'
                              ? '#EF4444'
                              : (liveCrowdMetrics?.crowdLevel || canteenStatus?.currentCrowdLevel) === 'LOW'
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
                              (liveCrowdMetrics?.crowdLevel || canteenStatus?.currentCrowdLevel) === 'PEAK'
                                ? '#F87171'
                                : (liveCrowdMetrics?.crowdLevel || canteenStatus?.currentCrowdLevel) === 'LOW'
                                ? '#34D399'
                                : '#FBBF24',
                          },
                        ]}
                      >
                        {liveCrowdMetrics?.crowdLevel || canteenStatus?.currentCrowdLevel} QUEUE ({liveCrowdMetrics?.crowdPercentage ?? canteenStatus?.crowdPercentage}%)
                      </Text>
                    </View>
                  </View>

                  {/* STARK GPS RADAR & GEOFENCE STATUS PANEL */}
                  <View style={styles.gpsRadarContainer}>
                    <View style={styles.gpsRadarHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={{ fontSize: 13 }}>🛰️</Text>
                        <Text style={styles.gpsRadarTitle}>
                          STARK RADAR: CAMPUS GEOFENCE
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.gpsScanBtn}
                        onPress={handleScanLocation}
                        disabled={isScanningGps}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.gpsScanBtnText}>
                          {isScanningGps ? 'Pinging GPS...' : '📡 Refresh GPS'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {liveLocation?.hasPermission ? (
                      <View style={styles.gpsStatusRow}>
                        <View style={[
                          styles.gpsStatusDot,
                          { backgroundColor: liveLocation.isInsideGeofence ? '#10B981' : '#F59E0B' }
                        ]} />
                        <View style={{ flex: 1, marginLeft: 8 }}>
                          <Text style={styles.gpsStatusText}>
                            {liveLocation.isInsideGeofence
                              ? `📍 INSIDE ${selectedCanteen.name.toUpperCase()} (within geofence ~${liveLocation.distanceMeters ?? 0}m)`
                              : `📍 OUTSIDE ZONE: ~${liveLocation.distanceMeters ?? '—'}m away from food counter`}
                          </Text>
                          <Text style={styles.gpsSubtext}>
                            {liveLocation.isInsideGeofence
                              ? 'Your presence is contributing to anonymous live crowd density.'
                              : 'Walk toward canteen to auto-register wait times and sync telemetry.'}
                          </Text>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.gpsPermissionNotice}>
                        <Text style={styles.gpsPermissionText}>
                          {liveLocation?.error || 'Location access is required to sense live counter proximity.'}
                        </Text>
                        <TouchableOpacity
                          style={styles.gpsGrantBtn}
                          onPress={handleScanLocation}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.gpsGrantBtnText}>Grant Location Access</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Live Crowd Telemetry Bar */}
                    <View style={styles.telemetryBarRow}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                          <Text style={styles.telemetryLabel}>Live Density</Text>
                          <Text style={styles.telemetryVal}>
                            {liveCrowdMetrics?.crowdPercentage ?? canteenStatus?.crowdPercentage ?? 20}% • Est. Wait: ~{liveCrowdMetrics?.estimatedWaitMinutes ?? 3} mins
                          </Text>
                        </View>
                        <View style={styles.progressBarTrack}>
                          <View
                            style={[
                              styles.progressBarFill,
                              {
                                width: `${Math.min(liveCrowdMetrics?.crowdPercentage ?? canteenStatus?.crowdPercentage ?? 20, 100)}%`,
                                backgroundColor:
                                  (liveCrowdMetrics?.crowdPercentage ?? canteenStatus?.crowdPercentage ?? 20) > 75
                                    ? '#EF4444'
                                    : (liveCrowdMetrics?.crowdPercentage ?? canteenStatus?.crowdPercentage ?? 20) > 40
                                    ? '#F59E0B'
                                    : '#10B981',
                              },
                            ]}
                          />
                        </View>
                      </View>
                    </View>

                    {/* Source tag & active phones */}
                    <View style={styles.radarMetaRow}>
                      <Text style={styles.radarMetaText}>
                        Mesh Mode: {liveCrowdMetrics?.source === 'GPS_LIVE_MESH' ? '🟢 Live Anonymous GPS Mesh' : '⏱️ Timetable Bell Schedule'}
                      </Text>
                      {liveCrowdMetrics?.activePingsCount !== undefined && liveCrowdMetrics.activePingsCount > 0 ? (
                        <Text style={[styles.radarMetaText, { color: '#10B981', fontWeight: '700' }]}>
                          {liveCrowdMetrics.activePingsCount} active device(s) in zone
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  <Text style={styles.canteenMsg}>
                    {liveCrowdMetrics?.statusTagline || canteenStatus?.statusMessage}
                  </Text>

                  {/* 1-Tap Student Vibe / Rush Check-in */}
                  <View style={styles.crowdReportingBox}>
                    <Text style={styles.crowdReportingTitle}>
                      Are you currently at the canteen? Quick Vibe Check:
                    </Text>
                    <View style={styles.crowdReportBtnRow}>
                      <TouchableOpacity
                        style={[styles.crowdReportBtn, { borderColor: '#10B981' }]}
                        onPress={() => handleReportCrowd('LOW')}
                        disabled={isSubmittingReport}
                      >
                        <Text style={[styles.crowdReportBtnText, { color: '#10B981' }]}>🟢 Empty / Fast</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.crowdReportBtn, { borderColor: '#F59E0B' }]}
                        onPress={() => handleReportCrowd('MODERATE')}
                        disabled={isSubmittingReport}
                      >
                        <Text style={[styles.crowdReportBtnText, { color: '#F59E0B' }]}>🟡 Normal Rush</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.crowdReportBtn, { borderColor: '#EF4444' }]}
                        onPress={() => handleReportCrowd('PEAK')}
                        disabled={isSubmittingReport}
                      >
                        <Text style={[styles.crowdReportBtnText, { color: '#EF4444' }]}>🔴 Packed Queue</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

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

      {/* Enhanced Hub Walkthrough Modal */}
      <Modal visible={showWalkthrough} animationType="fade" transparent>
        <View style={[styles.modalOverlay, isLightMode && { backgroundColor: 'rgba(15, 23, 42, 0.55)' }]}>
          <View
            style={[
              styles.modalCard,
              { maxWidth: 500, width: '100%', alignSelf: 'center', maxHeight: '85%' },
              isLightMode && {
                backgroundColor: '#FFFFFF',
                borderColor: '#CBD5E1',
                shadowColor: '#64748B',
                shadowOpacity: 0.18,
                shadowOffset: { width: 0, height: 8 },
                shadowRadius: 20,
                elevation: 10,
              },
            ]}
          >
            {(() => {
              const walkthroughSteps = [
                {
                  tab: 'NEWS' as HubSection,
                  icon: '🌅',
                  badge: 'STEP 1 • 08:00 AM BRIEFING',
                  title: 'Preparoo DayStarter & Market Radar',
                  description:
                    'Every morning at 08:00 AM, review the executive DayStarter compilation (Nifty/Sensex anchor levels, institutional FII/DII cash flows, Options PCR, and corporate earnings like IndiGo and Asian Paints). During trading hours (9:15 AM - 3:30 PM), indices update live with market ticks.',
                  actionTip: 'Tap the source link anytime to read the full issue or cite data in your classes.',
                },
                {
                  tab: 'NEWS' as HubSection,
                  icon: '📰',
                  badge: 'STEP 2 • PRESS FEED',
                  title: '15-Minute Curated Business Press',
                  description:
                    'Direct headlines from The Hindu, BusinessLine, Business Standard, and Mint. Every story includes a customized MBA Takeaway tailored to your Economics (EDM), Operations (MCOB), and Securities (ADM) coursework.',
                  actionTip: 'Auto-refreshes every 15 minutes, or tap the Refresh button to force-sync.',
                },
                {
                  tab: 'CANTEEN_XEROX' as HubSection,
                  icon: '🍽️',
                  badge: 'STEP 3 • CANTEEN RADAR',
                  title: 'Real-Time Canteen Crowd Mesh',
                  description:
                    'Check queue intensity across all 3 dining spots: Main IM Canteen, Campus Annex, and Coffee Kiosk (8:30 AM - 6:00 PM; Lunch 12:30-2:00 PM). GPS auto-detects if you are on-site to submit peer crowd updates.',
                  actionTip: 'View the live peak meter before walking over between lectures.',
                },
                {
                  tab: 'CANTEEN_XEROX' as HubSection,
                  icon: '🖨️',
                  badge: 'STEP 4 • ZERO-QUEUE XEROX',
                  title: 'Print Cost Calculator & UPI Pay',
                  description:
                    'Enter your page count, select B&W vs Color, double-sided, or spiral binding to get the exact cost. Scan the shop UPI QR code to pay, then tap "Send via WhatsApp" to send your document for zero-wait pickup.',
                  actionTip: 'Avoid peak queues before project deadlines and internal assignment submissions.',
                },
                {
                  tab: 'FACULTY' as HubSection,
                  icon: '👨‍🏫',
                  badge: 'STEP 5 • FACULTY CONSULT',
                  title: 'Office Hours & Doubt Clearance',
                  description:
                    'Directly view faculty consultation cabins and available office hour windows. Reserve 1-on-1 slots in one tap to review trimester projects, internships, or academic doubts.',
                  actionTip: 'Reservations prevent conflicting bookings during busy assessment weeks.',
                },
                {
                  tab: 'SYLLABUS' as HubSection,
                  icon: '📈',
                  badge: 'STEP 6 • SYLLABUS TRACKER',
                  title: 'Curriculum Velocity Telemetry',
                  description:
                    'Monitor syllabus pacing across all 8 trimester courses. Compare actual classes conducted against university targets to anticipate upcoming internals and exam dates.',
                  actionTip: 'Use velocity indicators to plan your revision schedule early.',
                },
                {
                  tab: 'LIBRARY' as HubSection,
                  icon: '📚',
                  badge: 'STEP 7 • LIBRARY SHIELD',
                  title: 'Due Dates & 1-Click Online Renewal',
                  description:
                    'Track borrowed library books, accession barcodes, and due countdowns. If a return deadline is near, tap "Renew Online (+14 Days)" to renew immediately without visiting the counter.',
                  actionTip: 'Guarantees zero library overdue fines throughout your trimester.',
                },
              ];

              const currentStep = walkthroughSteps[walkthroughStep] || walkthroughSteps[0];
              const totalSteps = walkthroughSteps.length;

              return (
                <View>
                  {/* Modal Header */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontSize: 24 }}>{currentStep.icon}</Text>
                      <View>
                        <View
                          style={{
                            backgroundColor: isLightMode ? '#EFF6FF' : 'rgba(56, 189, 248, 0.15)',
                            paddingHorizontal: 7,
                            paddingVertical: 2,
                            borderRadius: 4,
                            alignSelf: 'flex-start',
                            marginBottom: 2,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 10,
                              fontWeight: '900',
                              color: isLightMode ? '#1D4ED8' : '#38BDF8',
                              letterSpacing: 0.5,
                            }}
                          >
                            {currentStep.badge}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.modalTitle,
                            isLightMode && { color: '#0F172A', fontWeight: '800' },
                          ]}
                        >
                          {currentStep.title}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => setShowWalkthrough(false)}
                      style={{ padding: 6 }}
                    >
                      <Text style={{ fontSize: 18, color: isLightMode ? '#64748B' : '#94A3B8', fontWeight: 'bold' }}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Step Description */}
                  <View
                    style={[
                      {
                        backgroundColor: isLightMode ? '#F8FAFC' : '#0F172A',
                        padding: 14,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: isLightMode ? '#E2E8F0' : '#334155',
                        marginVertical: 10,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        lineHeight: 20,
                        color: isLightMode ? '#334155' : '#CBD5E1',
                      }}
                    >
                      {currentStep.description}
                    </Text>

                    <View
                      style={{
                        marginTop: 10,
                        paddingTop: 8,
                        borderTopWidth: 1,
                        borderTopColor: isLightMode ? '#E2E8F0' : '#1E293B',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Text style={{ fontSize: 12 }}>💡</Text>
                      <Text
                        style={{
                          fontSize: 11.5,
                          fontWeight: '700',
                          color: isLightMode ? '#1E40AF' : '#38BDF8',
                          flex: 1,
                        }}
                      >
                        {currentStep.actionTip}
                      </Text>
                    </View>
                  </View>

                  {/* Step Progress Dots */}
                  <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginVertical: 12 }}>
                    {walkthroughSteps.map((_, i) => (
                      <TouchableOpacity
                        key={i}
                        onPress={() => {
                          setWalkthroughStep(i);
                          setActiveSection(walkthroughSteps[i].tab);
                        }}
                        style={{
                          width: i === walkthroughStep ? 20 : 7,
                          height: 7,
                          borderRadius: 4,
                          backgroundColor:
                            i === walkthroughStep
                              ? isLightMode
                                ? '#2563EB'
                                : '#38BDF8'
                              : isLightMode
                              ? '#CBD5E1'
                              : '#334155',
                        }}
                      />
                    ))}
                  </View>

                  {/* Step Action Buttons */}
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                    {walkthroughStep > 0 && (
                      <TouchableOpacity
                        style={[
                          styles.modalCancelBtn,
                          isLightMode && {
                            backgroundColor: '#F1F5F9',
                            borderWidth: 1,
                            borderColor: '#E2E8F0',
                          },
                        ]}
                        onPress={() => {
                          const prev = walkthroughStep - 1;
                          setWalkthroughStep(prev);
                          setActiveSection(walkthroughSteps[prev].tab);
                        }}
                      >
                        <Text style={[styles.modalCancelText, isLightMode && { color: '#475569', fontWeight: '700' }]}>
                          Previous
                        </Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={[
                        styles.modalSubmitBtn,
                        isLightMode && { backgroundColor: '#2563EB' },
                      ]}
                      onPress={() => {
                        if (walkthroughStep < totalSteps - 1) {
                          const next = walkthroughStep + 1;
                          setWalkthroughStep(next);
                          setActiveSection(walkthroughSteps[next].tab);
                        } else {
                          setShowWalkthrough(false);
                          setWalkthroughStep(0);
                        }
                      }}
                    >
                      <Text style={styles.modalSubmitText}>
                        {walkthroughStep < totalSteps - 1 ? `Next (${walkthroughStep + 1}/${totalSteps}) →` : 'Got It! Start Exploring'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })()}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const getStyles = (isLightMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isLightMode ? '#F1F5F9' : '#050505',
  },
  topHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: isLightMode ? '#FFFFFF' : '#121212',
    borderBottomWidth: 1.5,
    borderBottomColor: isLightMode ? '#E2E8F0' : '#262626',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: isLightMode ? '#0F172A' : '#10B981',
    letterSpacing: 1.1,
  },
  headerSubtitle: {
    fontSize: 11,
    color: isLightMode ? '#64748B' : '#9CA3AF',
    marginTop: 2,
  },
  badgeLive: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: isLightMode ? '#ECFDF5' : 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: isLightMode ? '#10B981' : '#10B981',
  },
  badgeLiveText: {
    fontSize: 10,
    fontWeight: '800',
    color: isLightMode ? '#047857' : '#34D399',
    letterSpacing: 0.8,
  },
  noticeBanner: {
    backgroundColor: isLightMode ? '#EFF6FF' : 'rgba(16, 185, 129, 0.15)',
    borderBottomWidth: 1,
    borderBottomColor: isLightMode ? '#BFDBFE' : '#10B981',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  noticeText: {
    color: isLightMode ? '#1E40AF' : '#10B981',
    fontSize: 12,
    fontWeight: '700',
  },
  navBarWrapper: {
    backgroundColor: isLightMode ? '#FFFFFF' : '#121212',
    borderBottomWidth: 1,
    borderBottomColor: isLightMode ? '#E2E8F0' : '#262626',
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
    backgroundColor: isLightMode ? '#F8FAFC' : '#050505',
    borderWidth: 1,
    borderColor: isLightMode ? '#E2E8F0' : '#262626',
  },
  navPillActive: {
    backgroundColor: isLightMode ? '#2B3990' : '#10B981',
    borderColor: isLightMode ? '#2B3990' : '#10B981',
  },
  navPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: isLightMode ? '#64748B' : '#9CA3AF',
  },
  navPillTextActive: {
    color: '#FFFFFF',
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
    color: isLightMode ? '#0F172A' : '#10B981',
  },
  sectionCaption: {
    fontSize: 12,
    color: isLightMode ? '#64748B' : '#9CA3AF',
    marginTop: 4,
    lineHeight: 17,
  },
  newsSyncBar: {
    marginTop: 10,
    backgroundColor: isLightMode ? '#FFFFFF' : '#050505',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: isLightMode ? '#E2E8F0' : '#262626',
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
    color: isLightMode ? '#065F46' : '#10B981',
    letterSpacing: 0.5,
  },
  newsRefreshBtn: {
    backgroundColor: isLightMode ? '#ECFDF5' : 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  newsRefreshBtnActive: {
    backgroundColor: isLightMode ? '#E2E8F0' : '#262626',
  },
  newsRefreshBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: isLightMode ? '#047857' : '#10B981',
    letterSpacing: 0.8,
  },
  card: {
    backgroundColor: isLightMode ? '#FFFFFF' : '#121212',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    borderColor: isLightMode ? '#E2E8F0' : '#262626',
    marginBottom: 14,
    shadowColor: isLightMode ? '#64748B' : undefined,
    shadowOpacity: isLightMode ? 0.08 : undefined,
    shadowOffset: isLightMode ? { width: 0, height: 2 } : undefined,
    shadowRadius: isLightMode ? 6 : undefined,
    elevation: isLightMode ? 2 : undefined,
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
    color: isLightMode ? '#2563EB' : '#10B981',
    letterSpacing: 0.8,
  },
  newsDate: {
    fontSize: 11,
    color: isLightMode ? '#64748B' : '#9CA3AF',
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: isLightMode ? '#0F172A' : '#10B981',
    marginBottom: 6,
    lineHeight: 20,
  },
  newsSummary: {
    fontSize: 12,
    color: isLightMode ? '#475569' : '#9CA3AF',
    lineHeight: 18,
    marginBottom: 10,
  },
  takeawayBox: {
    backgroundColor: isLightMode ? '#F8FAFC' : '#050505',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: isLightMode ? '#2563EB' : '#10B981',
    borderWidth: isLightMode ? 1 : 0,
    borderColor: isLightMode ? '#E2E8F0' : undefined,
    marginBottom: 10,
  },
  takeawayLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: isLightMode ? '#1E40AF' : '#10B981',
    marginBottom: 2,
  },
  takeawayText: {
    fontSize: 12,
    color: isLightMode ? '#334155' : '#9CA3AF',
    lineHeight: 17,
  },
  newsReadMoreBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  newsReadMoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: isLightMode ? '#2563EB' : '#10B981',
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
    backgroundColor: isLightMode ? '#FFFFFF' : '#121212',
    borderWidth: 1,
    borderColor: isLightMode ? '#CBD5E1' : '#262626',
    alignItems: 'center',
  },
  subTabBtnActive: {
    backgroundColor: isLightMode ? '#2B3990' : '#10B981',
    borderColor: isLightMode ? '#2B3990' : '#10B981',
  },
  subTabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: isLightMode ? '#64748B' : '#9CA3AF',
  },
  subTabBtnTextActive: {
    color: '#FFFFFF',
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
    backgroundColor: isLightMode ? '#F8FAFC' : '#050505',
    borderWidth: 1,
    borderColor: isLightMode ? '#E2E8F0' : '#262626',
    alignItems: 'center',
  },
  canteenChipActive: {
    backgroundColor: isLightMode ? '#EEF2FF' : 'rgba(16, 185, 129, 0.15)',
    borderColor: isLightMode ? '#6366F1' : '#10B981',
  },
  canteenChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: isLightMode ? '#64748B' : '#9CA3AF',
  },
  canteenChipTextActive: {
    color: isLightMode ? '#4338CA' : '#10B981',
    fontWeight: '800',
  },
  canteenName: {
    fontSize: 15,
    fontWeight: '800',
    color: isLightMode ? '#0F172A' : '#10B981',
  },
  canteenTagline: {
    fontSize: 11,
    color: isLightMode ? '#64748B' : '#9CA3AF',
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
    color: isLightMode ? '#475569' : '#9CA3AF',
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
    backgroundColor: isLightMode ? '#F8FAFC' : '#050505',
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: isLightMode ? '#E2E8F0' : '#262626',
  },
  infoLabel: {
    fontSize: 10,
    color: isLightMode ? '#64748B' : '#9CA3AF',
    marginBottom: 2,
  },
  infoVal: {
    fontSize: 12,
    fontWeight: '700',
    color: isLightMode ? '#0F172A' : '#10B981',
  },
  foodNoticeBox: {
    backgroundColor: isLightMode ? '#ECFDF5' : 'rgba(16, 185, 129, 0.08)',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
    marginTop: 6,
    marginBottom: 10,
    borderWidth: isLightMode ? 1 : 0,
    borderColor: isLightMode ? '#A7F3D0' : undefined,
  },
  foodNoticeTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: isLightMode ? '#065F46' : '#10B981',
    marginBottom: 2,
  },
  foodNoticeBody: {
    fontSize: 11,
    color: isLightMode ? '#047857' : '#9CA3AF',
    lineHeight: 16,
  },
  specialtiesBox: {
    marginTop: 6,
  },
  specialtiesTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: isLightMode ? '#0F172A' : '#10B981',
    marginBottom: 6,
  },
  specialtiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  specialtyChip: {
    backgroundColor: isLightMode ? '#F8FAFC' : '#050505',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: isLightMode ? '#E2E8F0' : '#262626',
  },
  specialtyChipText: {
    fontSize: 10,
    color: isLightMode ? '#475569' : '#9CA3AF',
    fontWeight: isLightMode ? '600' : 'normal',
  },
  rateCardBox: {
    backgroundColor: isLightMode ? '#F8FAFC' : '#050505',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: isLightMode ? '#E2E8F0' : '#262626',
    marginTop: 10,
  },
  rateCardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: isLightMode ? '#0F172A' : '#10B981',
    marginBottom: 6,
  },
  rateGrid: {
    gap: 4,
  },
  rateItem: {
    fontSize: 11,
    color: isLightMode ? '#475569' : '#9CA3AF',
  },
  calculatorTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: isLightMode ? '#0F172A' : '#10B981',
    marginBottom: 4,
  },
  calculatorSubtitle: {
    fontSize: 11,
    color: isLightMode ? '#64748B' : '#9CA3AF',
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
    color: isLightMode ? '#475569' : '#10B981',
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: isLightMode ? '#F8FAFC' : '#050505',
    borderWidth: 1,
    borderColor: isLightMode ? '#CBD5E1' : '#262626',
    borderRadius: 8,
    color: isLightMode ? '#0F172A' : '#10B981',
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
    backgroundColor: isLightMode ? '#F8FAFC' : '#050505',
    borderWidth: 1,
    borderColor: isLightMode ? '#E2E8F0' : '#262626',
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: isLightMode ? '#EEF2FF' : 'rgba(16, 185, 129, 0.15)',
    borderColor: isLightMode ? '#2B3990' : '#10B981',
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: isLightMode ? '#64748B' : '#9CA3AF',
  },
  toggleBtnTextActive: {
    color: isLightMode ? '#2B3990' : '#10B981',
    fontWeight: '800',
  },
  totalBox: {
    backgroundColor: isLightMode ? '#F8FAFC' : '#050505',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1.5,
    borderColor: isLightMode ? '#2B3990' : '#10B981',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 14,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: isLightMode ? '#0F172A' : '#10B981',
  },
  totalNote: {
    fontSize: 10,
    color: isLightMode ? '#64748B' : '#9CA3AF',
    marginTop: 2,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: isLightMode ? '#2B3990' : '#10B981',
  },
  xeroxActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  qrBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: isLightMode ? '#F1F5F9' : '#121212',
    borderWidth: 1,
    borderColor: isLightMode ? '#CBD5E1' : '#262626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: isLightMode ? '#475569' : '#10B981',
  },
  sendWhatsAppBtn: {
    flex: 1.2,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: isLightMode ? '#10B981' : '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendWhatsAppBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  qrDisplayCard: {
    backgroundColor: isLightMode ? '#F8FAFC' : '#050505',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: isLightMode ? '#E2E8F0' : '#262626',
    marginTop: 14,
    alignItems: 'center',
  },
  qrCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: isLightMode ? '#0F172A' : '#10B981',
  },
  qrCardSubtitle: {
    fontSize: 11,
    color: isLightMode ? '#64748B' : '#9CA3AF',
    marginTop: 2,
    marginBottom: 12,
  },
  mockQrPlaceholder: {
    width: 180,
    height: 180,
    backgroundColor: isLightMode ? '#FFFFFF' : '#121212',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: isLightMode ? '#2B3990' : '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  mockQrText: {
    fontSize: 12,
    fontWeight: '900',
    color: isLightMode ? '#0F172A' : '#10B981',
    letterSpacing: 1,
  },
  mockQrSub: {
    fontSize: 11,
    color: isLightMode ? '#2563EB' : '#34D399',
    marginTop: 8,
    fontWeight: '700',
  },
  qrInstructions: {
    fontSize: 10,
    color: isLightMode ? '#64748B' : '#9CA3AF',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 15,
  },
  facName: {
    fontSize: 14,
    fontWeight: '800',
    color: isLightMode ? '#0F172A' : '#10B981',
  },
  facSubject: {
    fontSize: 11,
    color: isLightMode ? '#64748B' : '#9CA3AF',
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
    color: isLightMode ? '#475569' : '#9CA3AF',
  },
  facCabin: {
    fontSize: 11,
    color: isLightMode ? '#64748B' : '#9CA3AF',
    marginTop: 4,
    marginBottom: 10,
  },
  bookSlotBtn: {
    backgroundColor: isLightMode ? '#2B3990' : '#10B981',
    paddingVertical: 9,
    borderRadius: 6,
    alignItems: 'center',
  },
  bookSlotBtnDisabled: {
    backgroundColor: isLightMode ? '#F1F5F9' : '#121212',
    borderWidth: 1,
    borderColor: isLightMode ? '#E2E8F0' : '#262626',
  },
  bookSlotBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: isLightMode ? '#FFFFFF' : '#050505',
  },
  sylCode: {
    fontSize: 12,
    fontWeight: '900',
    color: isLightMode ? '#2563EB' : '#10B981',
  },
  sylTitle: {
    fontSize: 13,
    color: isLightMode ? '#0F172A' : '#9CA3AF',
    fontWeight: isLightMode ? '700' : 'normal',
    marginTop: 2,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: isLightMode ? '#E2E8F0' : '#050505',
    borderRadius: 4,
    marginTop: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: isLightMode ? '#2B3990' : '#10B981',
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
    color: isLightMode ? '#64748B' : '#9CA3AF',
  },
  sylMetricVal: {
    fontSize: 12,
    fontWeight: '800',
    color: isLightMode ? '#0F172A' : '#10B981',
    marginTop: 2,
  },
  bookTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: isLightMode ? '#0F172A' : '#10B981',
  },
  bookAuthor: {
    fontSize: 11,
    color: isLightMode ? '#64748B' : '#9CA3AF',
    marginTop: 2,
  },
  bookAccession: {
    fontSize: 10,
    color: isLightMode ? '#64748B' : '#9CA3AF',
    marginTop: 1,
  },
  bookRenewBtn: {
    marginTop: 10,
    backgroundColor: isLightMode ? '#EEF2FF' : '#121212',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isLightMode ? '#6366F1' : '#10B981',
  },
  bookRenewBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: isLightMode ? '#4338CA' : '#10B981',
  },
  // Market Ticker & Live Quotes Styles
  marketTickerCard: {
    backgroundColor: isLightMode ? '#FFFFFF' : '#121212',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: isLightMode ? '#E2E8F0' : '#262626',
    marginBottom: 14,
    shadowColor: isLightMode ? '#64748B' : undefined,
    shadowOpacity: isLightMode ? 0.08 : undefined,
    shadowOffset: isLightMode ? { width: 0, height: 2 } : undefined,
    shadowRadius: isLightMode ? 6 : undefined,
    elevation: isLightMode ? 2 : undefined,
  },
  marketTickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  marketStatusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  marketTickerTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: isLightMode ? '#0F172A' : '#F8FAFC',
    letterSpacing: 0.3,
  },
  marketSourceTag: {
    fontSize: 10,
    fontWeight: '700',
    color: isLightMode ? '#2563EB' : '#38BDF8',
  },
  quotePillRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  quotePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: isLightMode ? '#F8FAFC' : '#050505',
    borderWidth: 1,
    borderColor: isLightMode ? '#E2E8F0' : '#262626',
  },
  quotePillActive: {
    backgroundColor: isLightMode ? '#EEF2FF' : '#1E293B',
    borderColor: isLightMode ? '#6366F1' : '#38BDF8',
  },
  quotePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: isLightMode ? '#64748B' : '#9CA3AF',
  },
  quotePillTextActive: {
    color: isLightMode ? '#4338CA' : '#38BDF8',
  },
  quotesScrollContainer: {
    gap: 10,
    paddingBottom: 4,
  },
  quoteCard: {
    backgroundColor: isLightMode ? '#F8FAFC' : '#050505',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: isLightMode ? '#E2E8F0' : '#262626',
    width: 145,
  },
  quoteCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  quoteSymbol: {
    fontSize: 11,
    fontWeight: '900',
    color: isLightMode ? '#0F172A' : '#F8FAFC',
  },
  quoteBadge: {
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  quoteBadgeUp: {
    backgroundColor: isLightMode ? '#ECFDF5' : 'rgba(16, 185, 129, 0.2)',
    color: isLightMode ? '#059669' : '#34D399',
  },
  quoteBadgeDown: {
    backgroundColor: isLightMode ? '#FEF2F2' : 'rgba(239, 68, 68, 0.2)',
    color: isLightMode ? '#DC2626' : '#F87171',
  },
  quoteName: {
    fontSize: 10,
    color: isLightMode ? '#64748B' : '#9CA3AF',
    marginBottom: 6,
  },
  quotePriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  quotePrice: {
    fontSize: 13,
    fontWeight: '800',
    color: isLightMode ? '#0F172A' : '#F8FAFC',
  },
  quoteChange: {
    fontSize: 10,
    fontWeight: '700',
  },
  quoteTextUp: {
    color: isLightMode ? '#059669' : '#34D399',
  },
  quoteTextDown: {
    color: isLightMode ? '#DC2626' : '#F87171',
  },
  quoteSourceText: {
    fontSize: 8.5,
    color: isLightMode ? '#94A3B8' : '#64748B',
    marginTop: 2,
  },
  // Daystarter Briefing Styles
  daystarterCard: {
    backgroundColor: isLightMode ? '#FFFFFF' : '#050505',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: isLightMode ? '#38BDF8' : '#38BDF8',
    marginBottom: 16,
    ...(isLightMode ? {
      shadowColor: '#64748B',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 3 },
      shadowRadius: 8,
      elevation: 2,
    } : {}),
  },
  daystarterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  daystarterBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  daystarterLiveBadge: {
    backgroundColor: isLightMode ? '#EFF6FF' : 'rgba(56, 189, 248, 0.2)',
    borderWidth: 1,
    borderColor: isLightMode ? '#93C5FD' : '#38BDF8',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  daystarterLiveBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: isLightMode ? '#1D4ED8' : '#38BDF8',
    letterSpacing: 0.5,
  },
  daystarterEditionDate: {
    fontSize: 11,
    color: isLightMode ? '#64748B' : '#94A3B8',
    fontWeight: '600',
  },
  daystarterHeadline: {
    fontSize: 16,
    fontWeight: '800',
    color: isLightMode ? '#0F172A' : '#F8FAFC',
    lineHeight: 22,
  },
  daystarterSourceBox: {
    backgroundColor: isLightMode ? '#F8FAFC' : '#121212',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#38BDF8',
    marginVertical: 10,
  },
  daystarterSourceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: isLightMode ? '#64748B' : '#94A3B8',
  },
  daystarterSourceLinkRow: {
    marginTop: 2,
  },
  daystarterSourceLink: {
    fontSize: 11,
    fontWeight: '800',
    color: isLightMode ? '#0284C7' : '#38BDF8',
  },
  daystarterSummaryText: {
    fontSize: 12,
    color: isLightMode ? '#334155' : '#CBD5E1',
    lineHeight: 18,
    marginBottom: 12,
  },
  anchorStatsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  anchorStatBox: {
    flex: 1,
    backgroundColor: isLightMode ? '#F8FAFC' : '#121212',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: isLightMode ? '#E2E8F0' : '#262626',
  },
  anchorStatLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: isLightMode ? '#64748B' : '#94A3B8',
    textTransform: 'uppercase',
  },
  anchorStatValue: {
    fontSize: 13,
    fontWeight: '900',
    color: isLightMode ? '#0F172A' : '#F8FAFC',
    marginTop: 2,
  },
  anchorStatChange: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 1,
  },
  anchorStatSubtext: {
    fontSize: 9,
    color: isLightMode ? '#64748B' : '#64748B',
    marginTop: 3,
    lineHeight: 12,
  },
  flowsCard: {
    backgroundColor: isLightMode ? '#F8FAFC' : '#121212',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: isLightMode ? '#E2E8F0' : '#262626',
    marginBottom: 12,
  },
  flowsTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: isLightMode ? '#0F172A' : '#F8FAFC',
    marginBottom: 8,
  },
  flowsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  flowMetric: {
    flex: 1,
  },
  flowLabel: {
    fontSize: 10,
    color: isLightMode ? '#64748B' : '#94A3B8',
  },
  flowVal: {
    fontSize: 13,
    fontWeight: '900',
    marginTop: 2,
  },
  flowsSourceText: {
    fontSize: 9,
    color: isLightMode ? '#64748B' : '#64748B',
    marginTop: 4,
  },
  macroPointersBox: {
    backgroundColor: isLightMode ? '#F8FAFC' : '#121212',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: isLightMode ? '#E2E8F0' : '#262626',
    marginBottom: 12,
  },
  macroPointersTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: isLightMode ? '#0F172A' : '#F8FAFC',
    marginBottom: 8,
  },
  macroPointerItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 6,
  },
  macroBullet: {
    color: isLightMode ? '#0284C7' : '#38BDF8',
    fontWeight: '900',
    fontSize: 12,
  },
  macroPointerText: {
    flex: 1,
    fontSize: 11,
    color: isLightMode ? '#334155' : '#CBD5E1',
    lineHeight: 16,
  },
  corporateBox: {
    backgroundColor: isLightMode ? '#F8FAFC' : '#121212',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: isLightMode ? '#E2E8F0' : '#262626',
    marginBottom: 12,
  },
  corporateTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: isLightMode ? '#0F172A' : '#F8FAFC',
    marginBottom: 8,
  },
  corporateItem: {
    backgroundColor: isLightMode ? '#FFFFFF' : '#050505',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#38BDF8',
    ...(isLightMode ? { borderWidth: 1, borderColor: '#E2E8F0', borderLeftColor: '#0284C7' } : {}),
  },
  corpHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  corpCompanyName: {
    fontSize: 11.5,
    fontWeight: '800',
    color: isLightMode ? '#0F172A' : '#F8FAFC',
  },
  corpTag: {
    backgroundColor: isLightMode ? '#EFF6FF' : 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    ...(isLightMode ? { borderWidth: 1, borderColor: '#BFDBFE' } : {}),
  },
  corpTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: isLightMode ? '#1D4ED8' : '#38BDF8',
  },
  corpResultText: {
    fontSize: 11,
    fontWeight: '700',
    color: isLightMode ? '#059669' : '#34D399',
    marginTop: 2,
  },
  corpDetailText: {
    fontSize: 10.5,
    color: isLightMode ? '#64748B' : '#94A3B8',
    marginTop: 2,
    lineHeight: 15,
  },
  daystarterReadBtn: {
    backgroundColor: isLightMode ? '#EFF6FF' : 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1.5,
    borderColor: isLightMode ? '#3B82F6' : '#38BDF8',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  daystarterReadBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: isLightMode ? '#1D4ED8' : '#38BDF8',
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '800',
    color: isLightMode ? '#0F172A' : '#F8FAFC',
    letterSpacing: 0.3,
  },
  gpsRadarContainer: {
    backgroundColor: isLightMode ? '#F8FAFC' : '#0B0F19',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: isLightMode ? '#E2E8F0' : '#1E293B',
    marginTop: 10,
    marginBottom: 12,
  },
  gpsRadarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gpsRadarTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: isLightMode ? '#0F172A' : '#F8FAFC',
    letterSpacing: 0.5,
  },
  gpsScanBtn: {
    backgroundColor: isLightMode ? '#EFF6FF' : 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: isLightMode ? '#3B82F6' : '#38BDF8',
  },
  gpsScanBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: isLightMode ? '#1D4ED8' : '#38BDF8',
  },
  gpsStatusRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: isLightMode ? '#FFFFFF' : '#050505',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: isLightMode ? '#E2E8F0' : '#262626',
    marginBottom: 8,
  },
  gpsStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  gpsStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: isLightMode ? '#0F172A' : '#F8FAFC',
  },
  gpsSubtext: {
    fontSize: 9.5,
    color: isLightMode ? '#64748B' : '#94A3B8',
    marginTop: 2,
  },
  gpsPermissionNotice: {
    backgroundColor: isLightMode ? '#FFFBEB' : 'rgba(245, 158, 11, 0.1)',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: isLightMode ? '#FDE68A' : '#F59E0B',
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gpsPermissionText: {
    fontSize: 10,
    color: isLightMode ? '#B45309' : '#FBBF24',
    flex: 1,
    marginRight: 8,
  },
  gpsGrantBtn: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  gpsGrantBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#000000',
  },
  telemetryBarRow: {
    marginTop: 4,
    marginBottom: 6,
  },
  telemetryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: isLightMode ? '#64748B' : '#94A3B8',
  },
  telemetryVal: {
    fontSize: 10.5,
    fontWeight: '800',
    color: isLightMode ? '#0F172A' : '#F8FAFC',
  },
  radarMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  radarMetaText: {
    fontSize: 9.5,
    color: isLightMode ? '#64748B' : '#94A3B8',
  },
  crowdReportingBox: {
    backgroundColor: isLightMode ? '#F1F5F9' : '#141414',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: isLightMode ? '#CBD5E1' : '#262626',
    marginTop: 6,
    marginBottom: 10,
  },
  crowdReportingTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    color: isLightMode ? '#334155' : '#CBD5E1',
    marginBottom: 6,
  },
  crowdReportBtnRow: {
    flexDirection: 'row',
    gap: 6,
  },
  crowdReportBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    backgroundColor: isLightMode ? '#FFFFFF' : '#050505',
  },
  crowdReportBtnText: {
    fontSize: 10,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: isLightMode ? '#FFFFFF' : '#121212',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: isLightMode ? '#CBD5E1' : '#262626',
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: isLightMode ? '#0F172A' : '#10B981',
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: isLightMode ? '#F1F5F9' : '#1E293B',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    color: isLightMode ? '#475569' : '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
  },
  modalSubmitBtn: {
    flex: 1,
    backgroundColor: isLightMode ? '#2563EB' : '#10B981',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});

