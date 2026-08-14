const PDFDocument = require('pdfkit');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const { recalculateOverallPercent } = require('./progressController');

const sanitizeFilename = (value) =>
  String(value || 'course')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() || 'course';

const drawCertificate = (doc, { userName, courseTitle, completionDate }) => {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  doc.rect(28, 28, pageWidth - 56, pageHeight - 56).lineWidth(4).stroke('#1a1a1a');
  doc.rect(40, 40, pageWidth - 80, pageHeight - 80).lineWidth(1).stroke('#8a8a8a');
  doc.rect(48, 48, pageWidth - 96, pageHeight - 96).lineWidth(0.5).stroke('#c8c8c8');

  doc
    .font('Times-Bold')
    .fontSize(36)
    .fillColor('#1a1a1a')
    .text('Certificate of Completion', 70, 110, {
      align: 'center',
      width: pageWidth - 140,
    });

  doc
    .moveTo(pageWidth / 2 - 80, 160)
    .lineTo(pageWidth / 2 + 80, 160)
    .lineWidth(1)
    .stroke('#1a1a1a');

  doc
    .font('Times-Roman')
    .fontSize(16)
    .fillColor('#444')
    .text('This certifies that', 70, 190, {
      align: 'center',
      width: pageWidth - 140,
    });

  doc
    .font('Times-Bold')
    .fontSize(28)
    .fillColor('#1a1a1a')
    .text(userName, 70, 230, {
      align: 'center',
      width: pageWidth - 140,
    });

  doc
    .font('Times-Roman')
    .fontSize(16)
    .fillColor('#444')
    .text('has successfully completed the course', 70, 280, {
      align: 'center',
      width: pageWidth - 140,
    });

  doc
    .font('Times-Bold')
    .fontSize(22)
    .fillColor('#1a1a1a')
    .text(courseTitle, 70, 320, {
      align: 'center',
      width: pageWidth - 140,
    });

  doc
    .font('Times-Roman')
    .fontSize(14)
    .fillColor('#444')
    .text(`Date of completion: ${completionDate}`, 70, 400, {
      align: 'center',
      width: pageWidth - 140,
    });

  doc
    .fontSize(12)
    .fillColor('#4343d5')
    .text('LearnHub', 70, pageHeight - 100, {
      align: 'center',
      width: pageWidth - 140,
    });
};

const generateCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    let progress = await Progress.findOne({
      user: req.user._id,
      course: course._id,
    });

    if (progress) {
      progress = await recalculateOverallPercent(progress);
    }

    if (!progress || progress.overallPercent < 100) {
      return res.status(403).json({
        message: 'Course must be 100% complete to download a certificate',
      });
    }

    const userName = req.user.name || req.user.email;
    const completionDate = new Date(
      progress.lastAccessedAt || Date.now(),
    ).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const filename = `certificate-${sanitizeFilename(course.title)}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const doc = new PDFDocument({
      size: 'LETTER',
      layout: 'landscape',
      margin: 50,
    });

    doc.on('error', (error) => {
      if (!res.headersSent) {
        res.status(500).json({ message: error.message });
      }
    });

    doc.pipe(res);
    drawCertificate(doc, {
      userName,
      courseTitle: course.title,
      completionDate,
    });
    doc.end();
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    if (!res.headersSent) {
      return res.status(500).json({ message: error.message });
    }
  }
};

module.exports = { generateCertificate };
