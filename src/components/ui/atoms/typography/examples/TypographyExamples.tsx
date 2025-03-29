import React from 'react';
import { Heading, Text, Paragraph, Blockquote, Code } from '..';

/**
 * Examples of typography components for documentation and testing
 */
export const TypographyExamples = () => {
  return (
    <div className="space-y-8">
      {/* Heading Examples */}
      <div>
        <Heading level={2} className="mb-4">Heading Component</Heading>
        <div className="space-y-2">
          <Heading level={1}>Heading 1</Heading>
          <Heading level={2}>Heading 2</Heading>
          <Heading level={3}>Heading 3</Heading>
          <Heading level={4}>Heading 4</Heading>
          <Heading level={5}>Heading 5</Heading>
          <Heading level={6}>Heading 6</Heading>
        </div>
        
        <div className="mt-6 space-y-2">
          <Heading level={2} size="4xl">Custom Size (4xl)</Heading>
          <Heading level={2} weight="light">Custom Weight (light)</Heading>
          <Heading level={2} truncate className="max-w-md">Truncated Heading with a very long text that should be truncated</Heading>
        </div>
      </div>
      
      {/* Text Examples */}
      <div>
        <Heading level={2} className="mb-4">Text Component</Heading>
        
        <div className="space-y-2">
          <Text>Default Text</Text>
          <div>
            <Text size="xs">Extra Small</Text> | 
            <Text size="sm"> Small</Text> | 
            <Text size="base"> Base</Text> | 
            <Text size="lg"> Large</Text> | 
            <Text size="xl"> Extra Large</Text>
          </div>
          
          <div>
            <Text weight="light">Light</Text> | 
            <Text weight="normal"> Normal</Text> | 
            <Text weight="medium"> Medium</Text> | 
            <Text weight="semibold"> Semibold</Text> | 
            <Text weight="bold"> Bold</Text>
          </div>
          
          <div>
            <Text color="default">Default</Text> | 
            <Text color="muted"> Muted</Text> | 
            <Text color="primary"> Primary</Text> | 
            <Text color="secondary"> Secondary</Text> | 
            <Text color="accent"> Accent</Text> | 
            <Text color="success"> Success</Text> | 
            <Text color="warning"> Warning</Text> | 
            <Text color="danger"> Danger</Text>
          </div>
          
          <div>
            <Text as="div">As a div</Text>
            <Text as="p">As a paragraph</Text>
            <Text as="label">As a label</Text>
          </div>
          
          <Text truncate className="max-w-md">Truncated text with a very long content that should be truncated at some point</Text>
        </div>
      </div>
      
      {/* Paragraph Examples */}
      <div>
        <Heading level={2} className="mb-4">Paragraph Component</Heading>
        
        <div className="space-y-2">
          <Paragraph>
            This is a default paragraph with default styling. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.
          </Paragraph>
          
          <Paragraph size="sm" color="muted">
            This is a small muted paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.
          </Paragraph>
          
          <Paragraph size="lg" color="primary">
            This is a large primary paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </Paragraph>
          
          <Paragraph spaced={false}>
            This paragraph has no bottom margin/spacing.
          </Paragraph>
          <Paragraph>
            Notice how this paragraph is directly below the previous one.
          </Paragraph>
        </div>
      </div>
      
      {/* Blockquote Examples */}
      <div>
        <Heading level={2} className="mb-4">Blockquote Component</Heading>
        
        <div className="space-y-4">
          <Blockquote>
            Simple blockquote without attribution. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Nullam euismod, nisl eget aliquam ultricies.
          </Blockquote>
          
          <Blockquote cite="Albert Einstein">
            The important thing is not to stop questioning. Curiosity has its own reason for existing.
          </Blockquote>
          
          <Blockquote size="sm" cite="Marie Curie">
            Nothing in life is to be feared, it is only to be understood. Now is the time to understand more, so that we may fear less.
          </Blockquote>
          
          <Blockquote size="lg" bordered={false} cite="Carl Sagan">
            Somewhere, something incredible is waiting to be known.
          </Blockquote>
        </div>
      </div>
      
      {/* Code Examples */}
      <div>
        <Heading level={2} className="mb-4">Code Component</Heading>
        
        <div className="space-y-4">
          <div>
            <Paragraph>
              Inline code example: <Code>const greeting = 'Hello, world!';</Code>
            </Paragraph>
            
            <Paragraph>
              You can use <Code>bg-primary-500</Code> to apply the primary color background.
            </Paragraph>
          </div>
          
          <div>
            <Code block>
{`function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));`}
            </Code>
            
            <Code block size="xs">
{`// Extra small code block
const colors = {
  primary: '#4a5568',
  secondary: '#718096',
  accent: '#00BFFF'
};`}
            </Code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypographyExamples; 