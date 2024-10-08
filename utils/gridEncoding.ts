// utils/gridEncoding.ts

export function encodeGrid(grid: number[][]): string {
    const flatGrid = grid.flat();
    const binaryString = flatGrid.map(num => num.toString(2).padStart(3, '0')).join('');
    const encoded = btoa(binaryString);
    return encoded;
  }
  
  export function decodeGrid(encoded: string): number[][] {
    try {
      const binaryString = atob(encoded);
      if (binaryString.length !== 108) {
        throw new Error('Invalid grid encoding');
      }
      const flatGrid = [];
      for (let i = 0; i < binaryString.length; i += 3) {
        const cellValue = parseInt(binaryString.slice(i, i + 3), 2);
        flatGrid.push(cellValue);
      }
      const grid = [];
      for (let i = 0; i < 6; i++) {
        grid.push(flatGrid.slice(i * 6, (i + 1) * 6));
      }
      return grid;
    } catch (error) {
      console.error('Error decoding grid:', error);
      throw new Error('Invalid grid encoding');
    }
  }