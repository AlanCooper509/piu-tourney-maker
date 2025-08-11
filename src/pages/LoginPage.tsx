import { Box, Button, Input, Stack, Text } from '@chakra-ui/react';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginForm() {
  const { user, signIn, signUp, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error: any) {
      setErrorMsg(error.message);
    }
    setLoading(false);
  };

  const handleSignUp = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await signUp(email, password);
    } catch (error: any) {
      setErrorMsg(error.message);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await signOut();
    } catch (error: any) {
      setErrorMsg(error.message);
    }
    setLoading(false);
  };

  return (
    <Box maxW="sm" mx="auto" p={4} borderWidth={1} borderRadius="md">
      <Stack gap={3}>
        {!user && (
          <>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />

            {errorMsg && <Text color="red.500">{errorMsg}</Text>}

            <Button
              colorPalette="blue"
              onClick={handleSignIn}
              loading={loading}
              disabled={loading}
            >
              <Text>Sign In</Text>
            </Button>

            <Button
              colorPalette="green"
              onClick={handleSignUp}
              loading={loading}
              disabled={loading}
            >
              <Text>Sign Up</Text>
            </Button>
          </>
        )}

        {user && (
          <>
            <Text>Signed in as: {user.email}</Text>
            <Button
              colorPalette="red"
              onClick={handleSignOut}
              loading={loading}
              disabled={loading}
            >
              <Text>Sign Out</Text>
            </Button>
          </>
        )}
      </Stack>
    </Box>
  );
}