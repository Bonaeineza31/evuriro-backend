export const createContact = async (req, res) => {
    try {
      const { names, email, subject, message } = req.body;
  
      // Create a new contact entry
      const newContact = new Contact({ names, email, subject, message });
      const savedContact = await newContact.save();
  
      // Create HTML content for the email
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #ea7b30;">Thank You for Contacting Us!</h2>
          <p>Hi ${names},</p>
          <p>Thank you for reaching out. We have received your message and will get back to you shortly.</p>
          
          <p>Best Regards,<br>Future Focus Rwanda Team</p>
        </div>
      `;
  
      // Send the email
      const emailSent = await sendEmail(email, subject, htmlContent);
      if (emailSent) {
        console.log("Confirmation email sent to:", email);
      }
  
      res.status(201).json(savedContact);
    } catch (error) {
      console.error("Error creating contact:", error);
      res.status(500).json({ error: "Failed to create contact" });
    }
  };