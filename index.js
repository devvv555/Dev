import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { registerRootComponent } from 'expo';
import App from './App';

class RootErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('[RootErrorBoundary] Uncaught React Error:', error, errorInfo);
  }

  handleReload = () => {
    if (typeof window !== 'undefined' && window.location) {
      window.location.reload();
    } else {
      this.setState({ hasError: false, error: null });
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={errStyles.container}>
          <Text style={errStyles.icon}>⚠️</Text>
          <Text style={errStyles.title}>PSGIM One Encountered an Issue</Text>
          <Text style={errStyles.message}>
            {this.state.error?.message || 'A unexpected runtime issue occurred while loading this view.'}
          </Text>
          <TouchableOpacity style={errStyles.button} onPress={this.handleReload} activeOpacity={0.8}>
            <Text style={errStyles.btnText}>Reload App</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const errStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  button: {
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

function Root() {
  return (
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  );
}

registerRootComponent(Root);

