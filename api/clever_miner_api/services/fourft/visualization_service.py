import io
import base64
import logging
import matplotlib.pyplot as plt

logger = logging.getLogger(__name__)

class VisualizationService:
    """Service class for visualization operations"""
    
    @staticmethod
    def generate_rule_visualization(clm, rule_id):
        """
        Generate a visualization of a rule using matplotlib.
        
        Args:
            clm: The CleverMiner instance
            rule_id: The ID of the rule to visualize
            
        Returns:
            str or None: Base64 encoded image data URI or None if visualization fails
        """
        # Initialize image_base64 to None
        image_base64 = None
        
        try:
            # Draw the rule but don't show it
            clm.draw_rule(rule_id, False)
            
            # Save the plot to a bytes buffer
            buf = io.BytesIO()
            plt.savefig(buf, format='png')
            buf.seek(0)
            image_base64 = base64.b64encode(buf.getvalue()).decode()
            plt.close()  # Clean up the plot
            
            # Return the data URI
            return f"data:image/png;base64,{image_base64}"
        except Exception as e:
            # Log the error but don't fail the request
            logger.error(f"Error generating plot for rule {rule_id}: {str(e)}")
            plt.close('all')  # Make sure to clean up any matplotlib resources
            return None 