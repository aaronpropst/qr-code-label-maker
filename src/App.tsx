import {
  Input,
  Heading,
  SimpleGrid,
  Box,
  NumberInputField,
  NumberInput,
  VStack
} from "@chakra-ui/react";
import QRCode from "react-qr-code";
import "./styles.css";
import { useLocalStorage } from "./useLocalStorage";

export default function App() {
  const [fState, setFState] = useLocalStorage("form-state", {
    url: "",
    label: "",
    num: 1
  });

  return (
    <Box p={4} className="App">
      <VStack className="inputs">
        <Box>
          <Input
            size="lg"
            placeholder="Url"
            type="text"
            value={fState.url}
            onChange={({ target: { value } }) => {
              setFState({ ...fState, url: value });
            }}
          />
        </Box>
        <Box>
          <Input
            size="lg"
            placeholder="Label"
            type="text"
            value={fState.label}
            onChange={({ target: { value } }) => {
              setFState({ ...fState, label: value });
            }}
          />
        </Box>
        <Box>
          <NumberInput
            value={fState.num}
            onChange={(value) => {
              setFState({ ...fState, num: parseInt(value, 10) });
            }}
          >
            <NumberInputField />
          </NumberInput>
        </Box>
      </VStack>
      <SimpleGrid columns={2} m="8" spacing="16">
        {new Array(fState.num || 1).fill("").map(() => (
          <VStack>
            {fState.url && (
              <Box width="256px" overflow="hidden">
                <QRCode value={fState.url} />
              </Box>
            )}
            {fState.label && (
              <Box>
                <Heading mt="5">{fState.label}</Heading>
              </Box>
            )}
          </VStack>
        ))}
      </SimpleGrid>
    </Box>
  );
}
