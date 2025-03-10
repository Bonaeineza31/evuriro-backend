import User from '../Models/UserModel.js';

// @desc    Update user health data
// @route   PUT /api/health/update
// @access  Private
export const updateHealthData = async (req, res) => {
  try {
    const { heartRate, bloodPressure, temperature, oxygenLevel, weight } = req.body;
    
    const healthData = {
      heartRate,
      bloodPressure,
      temperature,
      oxygenLevel,
      weight
    };
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { healthData },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: user.healthData
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get user health data
// @route   GET /api/health
// @access  Private
export const getHealthData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.status(200).json({
      success: true,
      data: user.healthData
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};