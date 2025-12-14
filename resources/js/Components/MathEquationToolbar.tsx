import React, { useState } from 'react';
import { Button } from "@/Components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/Components/ui/popover";
import { ChevronsUpDown, Sigma, Type } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";

interface MathEquationToolbarProps {
  onInsert: (equation: string) => void;
  placeholder?: string;
}

const MathEquationToolbar: React.FC<MathEquationToolbarProps> = ({ onInsert }) => {
  const [open, setOpen] = useState(false);

  // Common mathematical symbols and expressions
  const symbols = [
    { label: 'α', value: '\\alpha' },
    { label: 'β', value: '\\beta' },
    { label: 'γ', value: '\\gamma' },
    { label: 'δ', value: '\\delta' },
    { label: 'ε', value: '\\epsilon' },
    { label: 'θ', value: '\\theta' },
    { label: 'λ', value: '\\lambda' },
    { label: 'π', value: '\\pi' },
    { label: 'σ', value: '\\sigma' },
    { label: 'φ', value: '\\phi' },
    { label: 'ω', value: '\\omega' },
    { label: '∞', value: '\\infty' },
    { label: '∅', value: '\\emptyset' },
    { label: '∠', value: '\\angle' },
    { label: '°', value: '^\\circ' },
    { label: '±', value: '\\pm' },
    { label: '×', value: '\\times' },
    { label: '÷', value: '\\div' },
    { label: '≠', value: '\\neq' },
    { label: '≤', value: '\\leq' },
    { label: '≥', value: '\\geq' },
    { label: '≪', value: '\\ll' },
    { label: '≫', value: '\\gg' },
    { label: '⊂', value: '\\subset' },
    { label: '⊃', value: '\\supset' },
    { label: '⊆', value: '\\subseteq' },
    { label: '⊇', value: '\\supseteq' },
    { label: '∈', value: '\\in' },
    { label: '∉', value: '\\notin' },
    { label: '∩', value: '\\cap' },
    { label: '∪', value: '\\cup' },
    { label: '∀', value: '\\forall' },
    { label: '∃', value: '\\exists' },
    { label: '∴', value: '\\therefore' },
    { label: '∵', value: '\\because' },
  ];

  // Common mathematical expressions
  const expressions = [
    { label: 'Fraction', value: '\\frac{#}{#}' },
    { label: 'Square Root', value: '\\sqrt{#}' },
    { label: 'nth Root', value: '\\sqrt[#]{#}' },
    { label: 'Power', value: '#^{#}' },
    { label: 'Subscript', value: '#_{#}' },
    { label: 'Integral', value: '\\int # d#' },
    { label: 'Definite Integral', value: '\\int_{#}^{#} # d#' },
    { label: 'Sum', value: '\\sum_{#}^{#}' },
    { label: 'Product', value: '\\prod_{#}^{#}' },
    { label: 'Limit', value: '\\lim_{# \\to #}' },
    { label: 'Derivative', value: '\\frac{d#}{d#}' },
    { label: 'Partial Derivative', value: '\\frac{\\partial #}{\\partial #}' },
    { label: 'Matrix 2x2', value: '\\begin{bmatrix} # & # \\\\ # & # \\end{bmatrix}' },
    { label: 'Matrix 3x3', value: '\\begin{bmatrix} # & # & # \\\\ # & # & # \\\\ # & # & # \\end{bmatrix}' },
    { label: 'Cases', value: '\\begin{cases} # & \\text{if } # \\\\ # & \\text{if } # \\end{cases}' },
  ];

  // Greek letters section
  const greekLetters = [
    { label: 'Α', value: 'A' },
    { label: 'Β', value: 'B' },
    { label: 'Γ', value: '\\Gamma' },
    { label: 'Δ', value: '\\Delta' },
    { label: 'Ε', value: 'E' },
    { label: 'Ζ', value: 'Z' },
    { label: 'Η', value: 'H' },
    { label: 'Θ', value: '\\Theta' },
    { label: 'Ι', value: 'I' },
    { label: 'Κ', value: 'K' },
    { label: 'Λ', value: '\\Lambda' },
    { label: 'Μ', value: 'M' },
    { label: 'Ν', value: 'N' },
    { label: 'Ξ', value: '\\Xi' },
    { label: 'Ο', value: 'O' },
    { label: 'Π', value: '\\Pi' },
    { label: 'Ρ', value: 'P' },
    { label: 'Σ', value: '\\Sigma' },
    { label: 'Τ', value: 'T' },
    { label: 'Υ', value: '\\Upsilon' },
    { label: 'Φ', value: '\\Phi' },
    { label: 'Χ', value: 'X' },
    { label: 'Ψ', value: '\\Psi' },
    { label: 'Ω', value: '\\Omega' },
  ];

  // Trigonometric functions
  const trigFunctions = [
    { label: 'sin', value: '\\sin' },
    { label: 'cos', value: '\\cos' },
    { label: 'tan', value: '\\tan' },
    { label: 'cot', value: '\\cot' },
    { label: 'sec', value: '\\sec' },
    { label: 'csc', value: '\\csc' },
    { label: 'arcsin', value: '\\arcsin' },
    { label: 'arccos', value: '\\arccos' },
    { label: 'arctan', value: '\\arctan' },
    { label: 'sinh', value: '\\sinh' },
    { label: 'cosh', value: '\\cosh' },
    { label: 'tanh', value: '\\tanh' },
  ];

  // Logarithmic functions
  const logFunctions = [
    { label: 'log', value: '\\log' },
    { label: 'ln', value: '\\ln' },
    { label: 'log₁₀', value: '\\log_{10}' },
    { label: 'log₂', value: '\\log_2' },
    { label: 'exp', value: '\\exp' },
  ];

  const insertSymbol = (value: string) => {
    onInsert(value);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Sigma className="w-4 h-4" />
          <ChevronsUpDown className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[400px] p-0"
        align="start"
        side="bottom"
      >
        <Tabs defaultValue="symbols" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="symbols" className="flex items-center gap-1">
              <Type className="w-4 h-4" />
              <span className="hidden sm:inline">Symbols</span>
            </TabsTrigger>
            <TabsTrigger value="greek" className="flex items-center gap-1">
              <Sigma className="w-4 h-4" />
              <span className="hidden sm:inline">Greek</span>
            </TabsTrigger>
            <TabsTrigger value="expressions" className="flex items-center gap-1">
              <Sigma className="w-4 h-4" />
              <span className="hidden sm:inline">Expr</span>
            </TabsTrigger>
            <TabsTrigger value="trig" className="flex items-center gap-1">
              <Sigma className="w-4 h-4" />
              <span className="hidden sm:inline">Trig</span>
            </TabsTrigger>
            <TabsTrigger value="log" className="flex items-center gap-1">
              <Sigma className="w-4 h-4" />
              <span className="hidden sm:inline">Log</span>
            </TabsTrigger>
          </TabsList>

          <div className="max-h-[300px] overflow-y-auto p-2">
            <TabsContent value="symbols" className="mt-0">
              <div className="grid grid-cols-8 gap-1">
                {symbols.map((symbol, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-sm font-normal"
                    onClick={() => insertSymbol(symbol.value)}
                    title={symbol.label}
                  >
                    {symbol.label}
                  </Button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="greek" className="mt-0">
              <div className="grid grid-cols-8 gap-1">
                {greekLetters.map((letter, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-sm font-normal"
                    onClick={() => insertSymbol(letter.value)}
                    title={letter.label}
                  >
                    {letter.label}
                  </Button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="expressions" className="mt-0">
              <div className="grid grid-cols-2 gap-2">
                {expressions.map((expr, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="h-auto py-2 text-xs justify-start"
                    onClick={() => insertSymbol(expr.value)}
                  >
                    {expr.label}
                  </Button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="trig" className="mt-0">
              <div className="grid grid-cols-4 gap-1">
                {trigFunctions.map((func, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => insertSymbol(`${func.value}(#)`)}>
                    {func.label}
                  </Button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="log" className="mt-0">
              <div className="grid grid-cols-3 gap-1">
                {logFunctions.map((func, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => insertSymbol(`${func.value}{#}`)}>
                    {func.label}
                  </Button>
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};

export default MathEquationToolbar;
