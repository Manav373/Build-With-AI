import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useThemeColors, useType, useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Screen, GlassCard, SectionTitle } from '@/components/ui/Screen';
import { PressableScale, FadeInUp, AnimatedProgress } from '@/components/ui/Motion';

interface Course {
  id: string;
  title: string;
  category: 'irrigation' | 'pests' | 'organic' | 'machinery';
  instructor: string;
  duration: string;
  lessonsCount: number;
  progressPercent: number;
  lessons: Lesson[];
  hasCertificate: boolean;
}

interface Lesson {
  id: string;
  title: string;
  duration: string;
  isCompleted: boolean;
}

export default function LearningScreen() {
  const colors = useThemeColors();
  const t = useType();
  const scheme = useColorScheme();
  const router = useRouter();

  // State machine: hub | course
  const [viewMode, setViewMode] = useState<'hub' | 'course'>('hub');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [offlineDownload, setOfflineDownload] = useState(false);

  const [courses, setCourses] = useState<Course[]>([
    {
      id: 'c1',
      title: '💧 Modern Drip Irrigation Setup',
      category: 'irrigation',
      instructor: 'Dr. Ramesh Sharma',
      duration: '1h 45m',
      lessonsCount: 4,
      progressPercent: 75,
      hasCertificate: true,
      lessons: [
        { id: 'l1', title: '1. Fundamentals of Drip Pipes', duration: '15 mins', isCompleted: true },
        { id: 'l2', title: '2. Fitting Pump Regulators & Valves', duration: '30 mins', isCompleted: true },
        { id: 'l3', title: '3. Calculating Soil Hydration levels', duration: '25 mins', isCompleted: true },
        { id: 'l4', title: '4. Clog Cleansing & Acid Flushing', duration: '35 mins', isCompleted: false },
      ],
    },
    {
      id: 'c2',
      title: '🐛 Organic Pest Management',
      category: 'organic',
      instructor: 'Sukhdev Singh (Organic Lead)',
      duration: '2h 10m',
      lessonsCount: 3,
      progressPercent: 0,
      hasCertificate: true,
      lessons: [
        { id: 'l5', title: '1. Sourcing Cold-Pressed Neem Oil', duration: '20 mins', isCompleted: false },
        { id: 'l6', title: '2. Compounding Garlic & Chilli Sprays', duration: '40 mins', isCompleted: false },
        { id: 'l7', title: '3. Introducing Beneficial Predator Insects', duration: '1h 10m', isCompleted: false },
      ],
    },
  ]);

  const handleOpenCourse = (c: Course) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedCourse(c);
    setViewMode('course');
  };

  const handleToggleLesson = (lessonId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (!selectedCourse) return;

    const updatedLessons = selectedCourse.lessons.map(les =>
      les.id === lessonId ? { ...les, isCompleted: !les.isCompleted } : les
    );

    const completedCount = updatedLessons.filter(l => l.isCompleted).length;
    const progressPercent = Math.round((completedCount / selectedCourse.lessonsCount) * 100);

    const updatedCourse = {
      ...selectedCourse,
      lessons: updatedLessons,
      progressPercent,
    };

    setSelectedCourse(updatedCourse);
    setCourses(prev => prev.map(c => c.id === selectedCourse.id ? updatedCourse : c));
  };

  const handleDownloadToggle = (val: boolean) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setOfflineDownload(val);
    if (val) {
      Alert.alert('Download Started', 'Course videos are downloading to offline cache (54.2 MB).');
    }
  };

  const handleClaimCertificate = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    Alert.alert('Congratulations!', 'Your KrishiAI Smart Farmer Certificate has been issued and saved to Reports folder.');
  };

  return (
    <Screen
      title="Krishi Academy"
      emoji="🎓"
      subtitle={viewMode === 'hub' ? 'Farming Tutorials & Courses' : 'Course Details'}
      back
      onBack={() => {
        if (viewMode === 'course') {
          setViewMode('hub');
        } else {
          router.back();
        }
      }}
    >
      {viewMode === 'hub' ? (
        <>
          {/* Progress tracker */}
          <FadeInUp index={0} distance={16}>
            <GlassCard padding={16}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[t.bodyStrong, { color: colors.text }]}>Learning Tracker</Text>
                  <Text style={[t.caption, { color: colors.textSecondary, marginTop: 2 }]}>1 of 2 Courses Complete</Text>
                </View>
                <View style={{ backgroundColor: colors.accent, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}>
                  <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '800' }}>+280 XP</Text>
                </View>
              </View>
              <AnimatedProgress fraction={0.5} color={colors.accent} trackColor={colors.surfaceElevated} />
              <Text style={[t.caption, { color: colors.textSecondary, alignSelf: 'flex-end', marginTop: 6 }]}>50% Complete</Text>
            </GlassCard>
          </FadeInUp>

          {/* Courses list */}
          <SectionTitle>AVAILABLE COURSES</SectionTitle>

          {courses.map((course, idx) => (
            <FadeInUp key={course.id} index={idx + 1} distance={16}>
              <PressableScale onPress={() => handleOpenCourse(course)} haptic="light">
                <GlassCard padding={16}>
                  <View style={{ marginBottom: 12 }}>
                    <Text style={[t.caption, { color: colors.textMuted, textTransform: 'uppercase', fontWeight: '800', letterSpacing: 0.5 }]}>
                      {course.instructor}
                    </Text>
                    <Text style={[t.bodyStrong, { color: colors.text, marginTop: 4 }]} numberOfLines={1}>{course.title}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <Text style={[t.caption, { color: colors.textSecondary, flexShrink: 1 }]}>
                      ⏱️ {course.duration} • 📚 {course.lessonsCount} lessons
                    </Text>
                    <Text style={[t.number, { color: colors.accent }]}>{course.progressPercent}%</Text>
                  </View>
                </GlassCard>
              </PressableScale>
            </FadeInUp>
          ))}
        </>
      ) : (
        selectedCourse && (
          <>
            {/* Course details header */}
            <FadeInUp index={0} distance={16}>
              <GlassCard padding={16}>
                <Text style={[t.label, { color: colors.accent, textTransform: 'uppercase', fontWeight: '800', letterSpacing: 0.5 }]}>
                  {selectedCourse.category}
                </Text>
                <Text style={[t.displayMedium, { color: colors.text, marginVertical: 8 }]}>{selectedCourse.title}</Text>
                <Text style={[t.bodySmall, { color: colors.textSecondary }]}>
                  Led by {selectedCourse.instructor} • {selectedCourse.duration}
                </Text>

                <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 16 }} />

                {/* Offline download toggle */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[t.bodyStrong, { color: colors.text }]}>Download Offline</Text>
                    <Text style={[t.caption, { color: colors.textSecondary, marginTop: 2 }]}>Save to device storage</Text>
                  </View>
                  <Switch
                    value={offlineDownload}
                    onValueChange={handleDownloadToggle}
                    trackColor={{ false: colors.border, true: colors.accent }}
                  />
                </View>
              </GlassCard>
            </FadeInUp>

            {/* Certificate claim */}
            {selectedCourse.progressPercent === 100 && (
              <FadeInUp index={1} distance={16}>
                <LinearGradient
                  colors={colors.gradient.warm}
                  style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, gap: 14 }}
                >
                  <Feather name="award" size={28} color="#ffffff" />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '800' }}>Certificate Unlocked!</Text>
                    <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '500', marginTop: 2 }}>You have fully mastered this course.</Text>
                  </View>
                  <PressableScale onPress={handleClaimCertificate} haptic="medium">
                    <View style={{ backgroundColor: '#ffffff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 }}>
                      <Text style={{ color: '#f59e0b', fontSize: 12, fontWeight: '800' }}>Claim</Text>
                    </View>
                  </PressableScale>
                </LinearGradient>
              </FadeInUp>
            )}

            {/* Lessons list */}
            <SectionTitle>LESSON SYLLABUS ({selectedCourse.progressPercent}% DONE)</SectionTitle>

            {selectedCourse.lessons.map((les, idx) => (
              <FadeInUp key={les.id} index={(selectedCourse.progressPercent === 100 ? 2 : 1) + idx} distance={16}>
                <PressableScale onPress={() => handleToggleLesson(les.id)} haptic="light">
                  <GlassCard padding={14}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={[{ width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' }, { borderColor: les.isCompleted ? colors.accent : colors.border, backgroundColor: les.isCompleted ? colors.accent : 'transparent' }]}>
                        {les.isCompleted && <Feather name="check" size={11} color="#ffffff" strokeWidth={3} />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[t.bodySmall, { color: colors.text, fontWeight: '700', textDecorationLine: les.isCompleted ? 'line-through' : 'none' }]}>
                          {les.title}
                        </Text>
                        <Text style={[t.caption, { color: colors.textSecondary, marginTop: 2 }]}>{les.duration}</Text>
                      </View>
                      <Feather name="play-circle" size={18} color={colors.accent} />
                    </View>
                  </GlassCard>
                </PressableScale>
              </FadeInUp>
            ))}
          </>
        )
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({});
