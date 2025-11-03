import { useState } from "react";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Bell, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAlerts } from "@/hooks/use-alerts";

export default function Alerts() {
  const { alerts, addAlert, toggleAlert: toggle, deleteAlert: remove } = useAlerts();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    marketId: '',
    marketName: '',
    condition: 'above' as 'above' | 'below',
    threshold: 50
  });
  const { toast } = useToast();

  const toggleAlert = (id: string) => {
    toggle(id);
    toast({
      title: "Alert updated",
      description: "Your alert settings have been saved",
    });
  };

  const deleteAlert = (id: string) => {
    remove(id);
    toast({
      title: "Alert deleted",
      description: "Alert has been removed",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.marketName || !formData.threshold) {
      toast({
        title: "Invalid input",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    addAlert({
      marketId: formData.marketId || Date.now().toString(),
      marketName: formData.marketName,
      condition: formData.condition,
      threshold: formData.threshold,
      enabled: true
    });
    toast({
      title: "Alert created",
      description: "You'll be notified when the market hits your threshold",
    });
    setFormData({ marketId: '', marketName: '', condition: 'above', threshold: 50 });
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">Price Alerts</h1>
            <p className="text-sm md:text-base text-foreground/70">
              Get notified when markets hit your target probability
            </p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            data-testid="button-create-alert"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Alert
          </Button>
        </div>

        {showForm && (
          <GlassCard gradient="violet" className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Create New Alert</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="market-name">Market Name</Label>
                <Input 
                  id="market-name" 
                  placeholder="Enter market name..."
                  value={formData.marketName}
                  onChange={(e) => setFormData(prev => ({ ...prev, marketName: e.target.value }))}
                  data-testid="input-market-name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="condition">Condition</Label>
                  <select 
                    id="condition"
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    value={formData.condition}
                    onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value as 'above' | 'below' }))}
                    data-testid="select-condition"
                  >
                    <option value="above">Goes above</option>
                    <option value="below">Goes below</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="threshold">Threshold (%)</Label>
                  <Input 
                    id="threshold" 
                    type="number" 
                    placeholder="50"
                    value={formData.threshold}
                    onChange={(e) => setFormData(prev => ({ ...prev, threshold: parseInt(e.target.value) || 0 }))}
                    data-testid="input-threshold"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" data-testid="button-save-alert">
                  <Bell className="w-4 h-4 mr-2" />
                  Create Alert
                </Button>
                <Button 
                  type="button"
                  variant="secondary" 
                  onClick={() => setShowForm(false)}
                  data-testid="button-cancel-alert"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </GlassCard>
        )}

        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 rounded-full bg-muted/50 mx-auto mb-4 flex items-center justify-center">
                <Bell className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No alerts configured</h3>
              <p className="text-muted-foreground">
                Create alerts to get notified about market movements
              </p>
            </div>
          ) : (
            alerts.map(alert => (
              <GlassCard key={alert.id} gradient="cyan" data-testid={`alert-${alert.id}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{alert.marketName}</h3>
                      <Badge variant={alert.enabled ? "default" : "secondary"}>
                        {alert.enabled ? "Active" : "Disabled"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Notify when probability goes {alert.condition} {alert.threshold}%
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Switch 
                      checked={alert.enabled}
                      onCheckedChange={() => toggleAlert(alert.id)}
                      data-testid={`switch-alert-${alert.id}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteAlert(alert.id)}
                      data-testid={`button-delete-${alert.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </GlassCard>
            ))
          )}
        </div>

        <div className="mt-8">
          <GlassCard gradient="gold">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-neon-gold flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Client-side alerts only</h3>
                <p className="text-sm text-muted-foreground">
                  Alerts are stored locally in your browser and will only trigger when you have this page open. 
                  No personal data is collected or sent to any server.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
