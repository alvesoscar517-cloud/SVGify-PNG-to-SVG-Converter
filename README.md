# SVGify - Professional Image to SVG Converter

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/alvesoscar517-cloud/SVG)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Chrome Extension](https://img.shields.io/badge/platform-Chrome%20Extension-orange.svg)](manifest.json)

> A powerful Chrome extension for converting raster images (JPG, PNG, BMP) to scalable vector graphics (SVG) with advanced vectorization technology.

## 🌟 Features

### Core Functionality
- **🎨 Advanced Vectorization**: Convert bitmap images to true vector graphics using ImageTracer.js technology
- **📦 Image Embedding**: Quick SVG creation by embedding PNG images (preserves original quality)
- **🖼️ Interactive Canvas**: Built on Fabric.js for real-time image manipulation and preview
- **⚡ Batch Processing**: Convert multiple images simultaneously with ZIP export
- **🎯 High-Quality Output**: Professional-grade vectorization with customizable color palettes

### User Interface
- **Modern Design**: Clean, intuitive interface with Lucide icons
- **Canvas Controls**: 
  - Zoom in/out functionality
  - Fit to screen
  - Pan and navigate large images
  - Undo/Redo support (up to 20 steps)
- **Real-time Preview**: See vectorization results instantly on canvas
- **Progress Tracking**: Visual feedback during processing with stage indicators

### Technical Capabilities
- **Multiple Input Formats**: JPG, PNG, BMP, GIF support
- **Smart Image Processing**: 
  - Automatic image smoothing with Pica.js
  - Color quantization
  - Edge detection and tracing
  - Curve optimization
- **Flexible Export**: Download individual SVG files or batch export as ZIP
- **Memory Efficient**: Handles images up to 10MB and 4096x4096 pixels

## 🚀 Installation

### For Users
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the project directory
6. Click the SVGify icon in your Chrome toolbar to launch

### For Developers
```bash
# Clone the repository
git clone https://github.com/alvesoscar517-cloud/SVG.git
cd SVG

# Install dependencies (optional, for development)
npm install

# Load extension in Chrome as described above
```

## 📖 Usage Guide

### Basic Workflow

1. **Upload Image**
   - Click the "Upload Image" button in the sidebar
   - Select a JPG, PNG, BMP, or GIF file (max 10MB)
   - Image will load onto the interactive canvas

2. **Choose Conversion Method**
   
   **Option A: Embed Image** (Fast)
   - Wraps your PNG image inside an SVG container
   - Preserves original quality
   - Best for: Quick conversions, photographs
   
   **Option B: Vectorize** (True Vector)
   - Converts to editable vector paths
   - Infinitely scalable without quality loss
   - Best for: Logos, icons, illustrations

3. **Download Result**
   - Click "Download SVG" to save your file
   - File naming: `[original-name]-embedded.svg` or `[original-name]-vectorized.svg`

### Batch Conversion

1. Click "Batch Convert" in the sidebar
2. Drag & drop or select multiple images (up to 50)
3. Choose conversion method (Embed or Vectorize)
4. Click "Start Conversion"
5. Download all results as a ZIP file

### Canvas Controls

- **Zoom**: Use toolbar buttons or mouse wheel
- **Pan**: Hold Shift + drag, or use middle mouse button
- **Undo/Redo**: Toolbar buttons or Ctrl+Z / Ctrl+Y
- **Fit to Screen**: Automatically scale image to viewport

## 🏗️ Architecture

### Project Structure
```
SVG/
├── manifest.json              # Chrome extension configuration
├── svgify.html               # Main application UI
├── background.js             # Service worker for extension
├── app-imagetracer.js        # Main application controller
├── app.css                   # Global styles
│
├── canvas/
│   └── canvas-manager.js     # Fabric.js canvas management
│
├── components/
│   ├── batch-converter.js    # Batch processing component
│   ├── sidebar-menu.js       # Navigation sidebar
│   ├── top-toolbar.js        # Canvas control toolbar
│   ├── progress-modal.js     # Processing progress display
│   ├── error-handler.js      # Error management system
│   ├── notification-modal.js # Toast notifications
│   └── donate-modal.js       # Support/unlock modal
│
├── vectorization/
│   ├── imagetracer-professional.js  # Advanced vectorization engine
│   ├── image-smoother.js            # Pre-processing smoothing
│   └── svg-exporter.js              # SVG file generation
│
├── libs/
│   ├── fabric.min.js         # Canvas manipulation library
│   ├── imagetracer.js        # Core vectorization algorithm
│   ├── pica.min.js           # Image resizing/smoothing
│   ├── jszip.min.js          # ZIP file creation
│   └── FileSaver.min.js      # File download utility
│
└── lucide/                   # Icon assets (SVG)
```

### Technology Stack

**Frontend Framework**
- Vanilla JavaScript (ES6+)
- HTML5 Canvas API
- CSS3 with Flexbox/Grid

**Core Libraries**
- [Fabric.js](http://fabricjs.com/) - Canvas object manipulation
- [ImageTracer.js](https://github.com/jankovicsandras/imagetracerjs) - Bitmap to vector conversion
- [Pica.js](https://github.com/nodeca/pica) - High-quality image resizing
- [JSZip](https://stuk.github.io/jszip/) - ZIP file generation
- [FileSaver.js](https://github.com/eligrey/FileSaver.js/) - Client-side file saving

**Chrome Extension APIs**
- Manifest V3
- Service Workers
- Storage API
- Action API

## 🔧 Key Components

### CanvasManager
Manages the Fabric.js canvas with features:
- Image loading and display
- Zoom and pan controls
- History management (undo/redo)
- Responsive canvas resizing
- Image data extraction for processing

### ImageTracer Professional
Advanced vectorization engine with:
- Color quantization algorithms
- Edge detection and tracing
- Bezier curve optimization
- Multi-layer SVG generation
- Configurable quality settings

### Batch Converter
Handles bulk image processing:
- Drag-and-drop file upload
- Progress tracking per image
- Parallel processing capability
- ZIP archive creation
- Error handling per file

### Error Handler
Centralized error management:
- Custom error types (FileLoadError, ProcessingError, etc.)
- User-friendly error messages
- Toast notification system
- File validation
- Dimension checking

## 🎯 Use Cases

### For Designers
- Convert hand-drawn sketches to editable vectors
- Create SVG versions of logo designs
- Prepare graphics for web use
- Generate scalable icons from raster images

### For Developers
- Convert UI assets to SVG for better scaling
- Create vector versions of image assets
- Reduce file sizes for web performance
- Generate inline SVG code

### For Content Creators
- Vectorize illustrations for print
- Create scalable graphics for presentations
- Convert photos to artistic vector representations
- Batch process image libraries

## ⚙️ Configuration

### Vectorization Settings
The vectorization engine uses optimized default settings:
- **Color Sampling**: Adaptive (2)
- **Number of Colors**: 16 (configurable)
- **Path Omit**: 8 pixels
- **Line Filter**: Enabled
- **Stroke Width**: 1px

### File Limits
- **Maximum File Size**: 10MB per image
- **Maximum Dimensions**: 4096 x 4096 pixels
- **Batch Limit**: 50 images per batch
- **Supported Formats**: JPG, JPEG, PNG, BMP, GIF

## 🔐 Privacy & Security

- **100% Client-Side**: All processing happens in your browser
- **No Server Upload**: Images never leave your computer
- **No Data Collection**: No analytics or tracking
- **Offline Capable**: Works without internet connection (after installation)
- **Open Source**: Full code transparency

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Report Bugs**: Open an issue with detailed reproduction steps
2. **Suggest Features**: Share your ideas in the issues section
3. **Submit Pull Requests**: 
   - Fork the repository
   - Create a feature branch (`git checkout -b feature/AmazingFeature`)
   - Commit your changes (`git commit -m 'Add some AmazingFeature'`)
   - Push to the branch (`git push origin feature/AmazingFeature`)
   - Open a Pull Request

### Development Guidelines
- Follow existing code style and structure
- Test thoroughly before submitting
- Update documentation for new features
- Keep commits atomic and well-described

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **ImageTracer.js** by András Jankovics - Core vectorization algorithm
- **Fabric.js** team - Canvas manipulation framework
- **Lucide Icons** - Beautiful icon set
- **Pica.js** by Vitaly Puzrin - Image processing
- All contributors and users of SVGify

## 📧 Contact & Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/alvesoscar517-cloud/SVG/issues)
- **GitHub Repository**: [https://github.com/alvesoscar517-cloud/SVG](https://github.com/alvesoscar517-cloud/SVG)

## 🗺️ Roadmap

### Planned Features
- [ ] Additional vectorization algorithms (Potrace integration)
- [ ] Custom color palette selection
- [ ] SVG optimization and compression
- [ ] Export to other vector formats (PDF, EPS)
- [ ] Advanced editing tools (path manipulation)
- [ ] Preset configurations for different use cases
- [ ] Cloud storage integration
- [ ] Collaborative features

## 📊 Performance

- **Average Processing Time**: 2-5 seconds per image (depends on size and complexity)
- **Memory Usage**: ~50-200MB during processing
- **Supported Browsers**: Chrome 88+, Edge 88+
- **Recommended**: Chrome 100+ for best performance

## 🎓 Technical Details

### Vectorization Process
1. **Pre-processing**: Image smoothing with Pica.js
2. **Color Quantization**: Reduce colors to manageable palette
3. **Layer Separation**: Split image into color layers
4. **Edge Tracing**: Detect and trace boundaries
5. **Path Generation**: Create SVG paths from traces
6. **Optimization**: Simplify curves and reduce nodes
7. **SVG Assembly**: Combine layers into final SVG

### Canvas Features
- **History Management**: Circular buffer with 20-step limit
- **Zoom Range**: 10% to 2000%
- **Pan Support**: Mouse drag and keyboard navigation
- **Responsive**: Auto-adjusts to window resize
- **Performance**: Debounced rendering for smooth interaction

---

**Made with ❤️ by the SVGify Team**

*If you find this tool useful, please consider giving it a ⭐ on GitHub!*
