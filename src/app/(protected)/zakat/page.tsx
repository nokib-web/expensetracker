import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ZakatPage() {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Zakat Calculator</h1>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Calculate Your Zakat</CardTitle>
                        <CardDescription>
                            Enter your wealth details to calculate your Zakat obligation (2.5% of eligible
                            wealth)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <Input label="Cash in Hand" type="number" placeholder="0.00" />
                                <Input label="Bank Balance" type="number" placeholder="0.00" />
                                <Input label="Investments" type="number" placeholder="0.00" />
                                <Input label="Gold (value)" type="number" placeholder="0.00" />
                                <Input label="Silver (value)" type="number" placeholder="0.00" />
                                <Input label="Business Assets" type="number" placeholder="0.00" />
                                <Input label="Debts Owed to You" type="number" placeholder="0.00" />
                                <Input label="Debts You Owe" type="number" placeholder="0.00" />
                            </div>
                            <Button type="submit" className="w-full">
                                Calculate Zakat
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Zakat Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Wealth:</span>
                                <span className="font-semibold">$0.00</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Net Wealth:</span>
                                <span className="font-semibold">$0.00</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Nisab Threshold:</span>
                                <span className="font-semibold">$0.00</span>
                            </div>
                            <div className="border-t pt-3 mt-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold">Zakat Due:</span>
                                    <span className="text-2xl font-bold text-[--color-primary]">$0.00</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
